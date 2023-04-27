import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { Context } from '../../lib/context'
import { gitDiffTag, gitSyncPublishTag } from '../../utils/git'
import { cdDir } from '../../utils'
import testGlobal from '../../utils/test'
import { organization, npmTag } from '../../utils/regExp'
import type { ExecuteCommandOptions, PluginData } from '../../defaultOptions'
function main (context: Context) {
  const mode = context.getCorrectOptionValue('publish', 'mode')

  if (mode === 'sync') {
    return handleSyncPublish(context)
  }
  else if (mode === 'diff') {
    return handleDiffPublish(context)
  }
}
export async function commandPublish (options: Partial<ExecuteCommandOptions> = {}, git: SimpleGit = simpleGit()) {
  const config = await Context.assignConfig(options)
  const context = await Context.create(
    config,
    git,
  )
  await main(context)
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
    action (context: Context, options: ExecuteCommandOptions['publish'] = {}) {
      context.assignOptions(options)
      main(context)
    },
  }
}
async function handleSyncPublish (context: Context) {
  for (let index = 0; index < context.allPackagesJSON.length; index++) {
    await implementPublish(
      context.allPackagesJSON[index],
      context.allDirs[index],
      context.options.publish.tag,
    )
  }
  gitSyncPublishTag(undefined, context.storeCommand.git)
}
async function handleDiffPublish (context: Context) {
  await context.storeCommand.forRepositoryDiffPack(async function (analysisBlock) {
    await implementPublish(
      analysisBlock.packageJson,
      analysisBlock.dir,
      context.options.publish.tag,
    )
  }, 'publish')
  gitDiffTag('publish', undefined, context.storeCommand.git)
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
    if (process.env.NODE_ENV === 'test') {
      if (testGlobal.pkgsTestPublish) {
        testGlobal.pkgsTestPublish(command)
      }
    }
    else {
      execSync(command)
    }
  }
}
