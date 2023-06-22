import { writeJSON } from 'fs-extra'
import { versionBumpInfo } from '@abmao/bump'
import colors from 'colors'
import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { gt } from 'semver'
import { gitSyncSave, gitDiffSave, gitTemporary, getTagVersion } from '../../utils/git'
import {
  Context,
} from '../../lib/context'
import { isTest, warn, writeFiles } from '../../utils'
import type { WriteObject } from '../../utils'
import { dependentSearch } from '../../utils/packageJson'
import { WARN_NOW_VERSION } from '../../constant'
import type { AnalysisBlockItem, SetAnalysisBlockObject } from '../../lib/analysisDiagram'
import type { PluginData, ExecuteCommandConfig } from '../../defaultOptions'
async function main (context: Context, appointVersion?: string) {
  const mode = context.getCorrectOptionValue('version', 'mode')

  if (mode === 'sync') {
    return handleSyncVersion(context, appointVersion)
  }
  else if (mode === 'diff') {
    return handleDiffVersion(context, appointVersion)
  }
}
export async function commandVersion (
  configParam: Partial<ExecuteCommandConfig> = {},
  git: SimpleGit = simpleGit(),
  appointVersion?: string,
) {
  const config = await Context.assignConfig(configParam)
  const context = await Context.create(
    config,
    git,
  )
  await main(context, appointVersion)
}
export function createVersionPlugin (): PluginData {
  return {
    id: 'version',
    command: 'version',
    description: 'version package',
    option: [
      ['--mode <type>', 'sync | diff'],
      ['-m, --message <message>', 'commit message'],
    ],
    action (context: Context, config: ExecuteCommandConfig['version'] = {}) {
      context.assignOptions(config)
      main(context)
    },
  }
}

// 获取仓库最新版本对应的包路径
async function versionTagToDir (context: Context) {
  const version = await getTagVersion(context)
  if (version) {
    const index = context.contextAnalysisDiagram.allPackagesJSON
      .findIndex(packageJson => packageJson.version === version)
    if (index !== -1) {
      return context.contextAnalysisDiagram.allDirs[index]
    }
  }
}

// 获取包里面版本最高的包路径
function getVersionMax (context: Context) {
  return context.contextAnalysisDiagram.allDirs.reduce((a, b) => {
    return gt(b, a) ? b : a
  })
}

// 获取包路径用于做版本升级依据
async function getSyncTargetVersionDir (context: Context) {
  const dir = await versionTagToDir(context)
  if (dir) {
    return dir
  }
  return getVersionMax(context)
}
async function getChangeVersion (context: Context, appointVersion?: string) {
  const dir = await getSyncTargetVersionDir(context)
  const analysisBlock = context.contextAnalysisDiagram.analysisDiagram[dir]
  const oldVersion = analysisBlock.packageJson.version
  const version = await changeVersion(dir, appointVersion)

  if (oldVersion === version) {
    if (isTest) {
      throw new Error(WARN_NOW_VERSION)
    }
    else {
      warn(WARN_NOW_VERSION)
      process.exit()
    }
  }
  return version
}
async function handleSyncVersion (context: Context, appointVersion?: string) {
  const version = await getChangeVersion(context, appointVersion)

  const changes: WriteObject[] = []

  // 依赖更新
  for (let index = 0; index < context.contextAnalysisDiagram.allPackagesJSON.length; index++) {
    const packageJson = context.contextAnalysisDiagram.allPackagesJSON[index]
    const analysisBlock = context.contextAnalysisDiagram.packageJsonToAnalysisBlock(packageJson)
    packageJson.version = version

    if (analysisBlock) {
      changes.push({
        filePath: context.contextAnalysisDiagram.allFilesPath[index],
        packageJson,
      })
      await changeRelyMyVersion(context, analysisBlock)
    }
  }
  await writeFiles(changes)
  await gitTemporary(
    changes.map(item => item.filePath),
    context.storeCommand.git,
  )
  await gitSyncSave(
    version as string,
    context.config.version.message,
    context.storeCommand.git,
  )
}
async function handleDiffVersion (context: Context, appointVersion?: string) {
  const triggerSign: SetAnalysisBlockObject = new Set()

  await context.storeCommand.forRepositoryDiffPack(async function (analysisBlock) {
    await changeVersionResultItem(
      context,
      analysisBlock,
      analysisBlock.dir,
      triggerSign,
      appointVersion,
    )
  })
  await writeJSONs(triggerSign)
  await gitTemporary(
    [...triggerSign].map(item => item.filePath),
    context.storeCommand.git,
  )
  await gitDiffSave(
    [...triggerSign],
    context.config.version.message,
    context.storeCommand.git,
  )
}

// 升级包
async function changeVersionResultItem (
  context: Context,
  analysisBlock: AnalysisBlockItem,
  dir: string,
  triggerSign: SetAnalysisBlockObject,
  appointVersion?: string,
) {
  const { packageJson } = analysisBlock

  if (triggerSign.has(analysisBlock)) return
  triggerSign.add(analysisBlock)

  const oldVersion = packageJson.version
  console.log(colors.white.bold(`package: ${packageJson.name}`))
  const version = await changeVersion(dir, appointVersion)

  if (version !== oldVersion) {
    packageJson.version = version
    await changeRelyMyVersion(context, analysisBlock, triggerSign, appointVersion)
  }
}

// 用来升级依赖当前包的包
async function changeRelyMyVersion (
  context: Context,
  analysisBlock: AnalysisBlockItem,
  triggerSign?: SetAnalysisBlockObject,
  appointVersion?: string,
) {
  const relyMyDir = analysisBlock.relyMyDir
  // 没有任务依赖当前包则跳出去
  if (!Array.isArray(relyMyDir)) return

  for (let i = 0; i < relyMyDir.length; i++) {
    const relyDir = relyMyDir[i]
    const analysisBlockRelyMy = context.contextAnalysisDiagram.analysisDiagram[relyDir]
    const isChange = dependentSearch(analysisBlock, analysisBlockRelyMy)

    // 只有有变更，并且带triggerSign，才会走version变动
    if (isChange && triggerSign && !triggerSign.has(analysisBlockRelyMy)) {
      await changeVersionResultItem(
        context,
        analysisBlockRelyMy,
        relyDir,
        triggerSign,
        appointVersion,
      )
    }
  }
}
function writeJSONs (triggerSign: SetAnalysisBlockObject) {
  return Promise.all(
    [...triggerSign].map(({ filePath, packageJson }) => {
      return writeJSON(filePath, packageJson, { spaces: 2 })
    }),
  )
}

async function changeVersion (cwd?: string, release?: string) {
  const versionBumpResults = await versionBumpInfo({
    release,
    cwd,
  })

  return versionBumpResults.newVersion
}
