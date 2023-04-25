import { writeJSON } from 'fs-extra'
import { versionBumpInfo } from '@abmao/bump'
import colors from 'colors'
import { gitSyncSave, gitDiffSave, gitTemporary } from '../../git'
import type {
  Context,
} from '../../index'
import { warn, writeFiles } from '../../utils'
import type { WriteObject } from '../../utils'
import { dependentSearch } from '../../utils/packageJson'
import { WARN_NOW_VERSION } from '../../constant'
import type { AnalysisBlockItem, SetAnalysisBlockObject } from '../../analysisDiagram'
// import type { PluginData, ExecuteCommandOptions } from '../../defaultOptions'

export function cmdVersion (context: Context, appointVersion?: string) {
  const mode = context.getCorrectOptionValue('version', 'mode')

  if (mode === 'sync') {
    return handleSyncVersion(context, appointVersion)
  }
  else if (mode === 'diff') {
    return handleDiffVersion(context, appointVersion)
  }
}
// export function versionPlugin (): PluginData {
//   return {
//     id: 'version',
//     description: 'version package',
//     option: [
//       ['--mode <type>', 'sync | diff'],
//       ['-m, --message <message>', 'commit message'],
//     ],
//     action (context: Context, options: ExecuteCommandOptions['version']) {
//       cmdVersion(context)
//     },
//   }
// }
async function handleSyncVersion (context: Context, appointVersion?: string) {
  const oldVersion = context.contextAnalysisDiagram.rootPackageJson.version
  const version = await changeVersion(context.contextAnalysisDiagram.rootDir, appointVersion)

  if (oldVersion === version) {
    if (process.env.NODE_ENV === 'test') {
      throw new Error(WARN_NOW_VERSION)
    }
    else {
      warn(WARN_NOW_VERSION)
      process.exit()
    }
  }
  context.contextAnalysisDiagram.rootPackageJson.version = version

  const changes: WriteObject[] = [
    {
      filePath: context.contextAnalysisDiagram.rootFilePath,
      packageJson: context.contextAnalysisDiagram.rootPackageJson,
    },
  ]

  // 依赖更新
  for (let index = 0; index < context.packagesJSON.length; index++) {
    const packageJson = context.packagesJSON[index]
    const analysisBlock = context.contextAnalysisDiagram.packageJsonToAnalysisBlock(packageJson)
    packageJson.version = version

    if (analysisBlock) {
      changes.push({
        filePath: context.filesPath[index],
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
    context.options.version.message,
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
  }, 'version')
  await writeJSONs(triggerSign)
  await gitTemporary(
    [...triggerSign].map(item => item.filePath),
    context.storeCommand.git,
  )
  await gitDiffSave(
    [...triggerSign].map(({ packageJson }) => {
      return `${packageJson.name as string}@${packageJson.version}`
    }),
    context.options.version.message,
    context.storeCommand.git,
  )
}
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
async function changeRelyMyVersion (
  context: Context,
  analysisBlock: AnalysisBlockItem,
  triggerSign?: SetAnalysisBlockObject,
  appointVersion?: string,
) {
  const relyMyDir = analysisBlock.relyMyDir
  // 没有依赖则跳出去
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
