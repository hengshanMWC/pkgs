import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { Context } from '../../lib/context'
import { gitSyncPublishTag } from '../../utils/git'
import { cdDir, isTest } from '../../utils'
import { organization, npmTag } from '../../utils/regExp'
import type { ExecuteCommandConfig, PluginData } from '../../defaultOptions'
function main (context: Context) {
  const mode = context.getCorrectOptionValue('publish', 'mode')

  if (mode === 'sync') {
    return handleSyncPublish(context)
  }
  else if (mode === 'diff') {
    return handleDiffPublish(context)
  }
}
export async function commandPublish (configParam: Partial<ExecuteCommandConfig> = {}, git: SimpleGit = simpleGit()) {
  const config = await Context.assignConfig(configParam)
  const context = await Context.create(
    config,
    git,
  )
  const result = await main(context)
  return result
}

export function createPublishPlugin (): PluginData {
  return {
    id: 'publish',
    command: 'publish',
    description: 'publish package',
    option: [
      ['--mode <type>', 'sync | diff'],
      ['-tag <type>', 'npm publish --tag <type>'],
    ],
    action (context: Context, config: ExecuteCommandConfig['publish'] = {}) {
      context.assignOptions(config)
      main(context)
    },
  }
}
async function handleSyncPublish (context: Context) {
  const commands: string[] = []
  for (let index = 0; index < context.contextAnalysisDiagram.allPackagesJSON.length; index++) {
    const command = await implementPublish(
      context.contextAnalysisDiagram.allPackagesJSON[index],
      context.contextAnalysisDiagram.allDirs[index],
      context.config.publish.tag,
    )
    command && commands.push(command)
  }
  await gitSyncPublishTag(undefined, context.storeCommand.git)
  return commands
}
async function handleDiffPublish (context: Context) {
  const commands: string[] = []
  await context.storeCommand.forRepositoryDiffPack(async function (analysisBlock) {
    const command = await implementPublish(
      analysisBlock.packageJson,
      analysisBlock.dir,
      context.config.publish.tag,
    )
    command && commands.push(command)
  })
  // await gitDiffTag('publish', undefined, context.storeCommand.git)
  return commands
}
async function implementPublish (
  packageJson: IPackageJson<any>,
  dir?: string,
  tag?: string,
) {
  if (!packageJson.private) {
    let command = `${cdDir(dir)}npm publish`

    if (new RegExp(organization).test(packageJson.name as string)) {
      command += ' --access public'
    }

    if (tag) {
      command += ` --tag ${tag}`
    }
    else if (packageJson.version) {
      const tagArr = packageJson.version.match(new RegExp(npmTag))
      if (tagArr) {
        command += ` --tag ${tagArr[1]}`
      }
    }
    if (!isTest) {
      execSync(command)
    }
    return command
  }
}
