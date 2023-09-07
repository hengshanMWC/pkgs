import { gt } from 'semver'
import type IPackageJson from '@ts-type/package-dts'
import { execa } from 'execa'
import { gitDiffSave, gitTag } from '../../utils/git'
import { isTest } from '../../utils'
import { npmTag, organization } from '../../utils/regExp'
import type { AnalysisBlockItem, Context, SetAnalysisBlockObject } from '../../lib'
import { getTagPublish } from './git'
import { Commands } from '../type'

export async function handleSyncPublish (context: Context) {
  const version = await getTagPublish(context)
  const { allDirs } = context.contextAnalysisDiagram
  const analysisBlockList: AnalysisBlockItem[] = []
  const commandList: Commands[] = []
  let versionTag = ''

  for (let index = 0; index < context.contextAnalysisDiagram.allPackagesJSON.length; index++) {
    const packageJson = context.contextAnalysisDiagram.allPackagesJSON[index]
    const analysisBlock = context.contextAnalysisDiagram.packageJsonToAnalysisBlock(packageJson)
    const currentVersion = packageJson?.version as string
    if (analysisBlock && (!version || gt(version, currentVersion))) {
      const command = await implementPublish(
        packageJson,
        allDirs[index],
        context.config.publish.tag,
      )
      if (command) {
        commandList.push(command)
        analysisBlockList.push(analysisBlock)
      }
      // 拿到最大的version当版本号
      versionTag = versionTag
        ? gt(versionTag, currentVersion)
          ? versionTag
          : currentVersion
        : currentVersion
    }
  }

  if (versionTag) {
    await gitTag(versionTag, analysisBlockList.map(item => item.packageJson.version).join(', '))
  }

  return {
    analysisBlockList,
    commandList,
  }
}

export async function handleDiffPublish (context: Context) {
  const triggerSign: SetAnalysisBlockObject = new Set()
  const commandList: Commands[] = []

  await context.fileStore.forRepositoryDiffPack(async function (analysisBlock) {
    const command = await implementPublish(
      analysisBlock.packageJson,
      analysisBlock.dir,
      context.config.publish.tag,
    )
    if (command) {
      triggerSign.add(analysisBlock)
      commandList.push(command)
    }
  }, '')

  const analysisBlockList = [...triggerSign]

  if (analysisBlockList.length) {
    await gitDiffSave(
      analysisBlockList.map(item => item.packageJson),
      context.config.publish.message,
      '',
      context.fileStore.git,
    )
  }

  return {
    analysisBlockList,
    commandList,
  }
}

async function implementPublish (
  packageJson: IPackageJson<any>,
  dir?: string,
  tag?: string,
): Promise<Commands | void> {
  if (!packageJson.private) {
    const command = 'pnpm'
    const args: string[] = ['publish']

    if (new RegExp(organization).test(packageJson.name as string)) {
      args.push('--access', 'public')
    }

    if (tag !== undefined) {
      args.push('--tag', tag)
    }
    else if (packageJson.version) {
      const tagArr = packageJson.version.match(new RegExp(npmTag))
      if (tagArr) {
        args.push('--tag', tagArr[1])
      }
    }
    if (!isTest) {
      await execa(command, args, { stdio: 'inherit', cwd: dir })
    }
    return {
      command,
      args,
      cwd: dir || ''
    }
  }
}


