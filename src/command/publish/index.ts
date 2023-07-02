import type { ExecaError } from 'execa'
import { execa } from 'execa'
import type { IPackageJson } from '@ts-type/package-dts'
import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { gt } from 'semver'
import { Context } from '../../lib/context'
import { cdDir, runCmdList } from '../../utils'
import { organization, npmTag } from '../../utils/regExp'
import type { ExecuteCommandPublishOption, PluginData } from '../../defaultOptions'
import type { AnalysisBlockItem } from '../../lib'

async function main (context: Context, tag?: string) {
  const editAnalysisBlockList = await getEditPackagePublish(context)
  const publishCmdStrList = editAnalysisBlockList
    .map(analysisBlockItem => createPublishCmd(
      analysisBlockItem?.packageJson,
      analysisBlockItem.dir,
      tag,
    ))
    .filter(cmd => cmd) as string[]
  const result = await runCmdList(publishCmdStrList)
  return result
}
export async function commandPublish (publishOption: ExecuteCommandPublishOption = {}, git: SimpleGit = simpleGit()) {
  const config = await Context.assignConfig()
  const context = await Context.create(
    config,
    git,
  )
  const result = await main(context, publishOption.tag)
  return result
}
async function validationPackageVersion (packageName: string, version: string) {
  try {
    const lineVersion = await execa('pnpm', ['view', packageName, 'version'])
    return gt(lineVersion.stdout, version)
  }
  catch (error: unknown) {
    const execaError = error as ExecaError
    return execaError.exitCode === 1 && execaError.stderr.includes('404')
  }
}
async function getEditPackagePublish (context: Context) {
  const contextAnalysisDiagram = context.contextAnalysisDiagram
  const validationList = contextAnalysisDiagram.allDirs.map((dir: string) => {
    const analysisBlockItem = contextAnalysisDiagram.analysisDiagram[dir]
    const { name, version } = analysisBlockItem.packageJson
    return validationPackageVersion(name as string, version as string)
      .then(b => b ? analysisBlockItem : undefined)
  })
  const analysisBlockItemList = await Promise.all(validationList)
  return analysisBlockItemList.filter(item => !!item) as AnalysisBlockItem[]
}

function createPublishCmd (
  packageJson: IPackageJson<any>,
  dir?: string,
  tag?: string,
) {
  if (!packageJson.private) {
    let command = `${cdDir(dir)}pnpm publish`

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
    return command
  }
}

export function createPublishPlugin (): PluginData {
  return {
    id: 'publish',
    command: 'publish',
    description: 'publish package',
    option: [
      ['-tag <type>', 'npm publish --tag <type>'],
    ],
    action (context: Context, config: ExecuteCommandPublishOption = {}) {
      main(context, config.tag)
    },
  }
}
