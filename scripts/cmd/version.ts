import { execSync } from 'child_process'
import { readFile, writeFile } from 'jsonfile'
import type { IPackageJson } from '@ts-type/package-dts'
import colors from 'colors'
import { gitSyncSave, gitDiffSave } from '../git'
import type {
  Context,
  AnalysisBlockObject,
  SetAnalysisBlockObject,
} from '../index'
import { fixCWD } from '../utils'
import { versionText } from '../utils/regExp'
import { getRelyAttrs } from '../utils/analysisDiagram'

export function cmdVersion (context: Context) {
  if (context.options.mode === 'sync') {
    return handleSyncVersion(context)
  }
  else if (context.options.mode === 'diff') {
    return handleDiffVersion(context)
  }
}
export async function handleSyncVersion (context: Context) {
  const { version: oldVersion } = await readFile('package.json') as IPackageJson
  const version = await changeVersion('package.json')

  if (oldVersion === version) {
    console.log('canceled: The version has not changed')
    process.exit()
  }

  for (let index = 0; index < context.packagesJSON.length; index++) {
    const packageJSON = context.packagesJSON[index]
    packageJSON.version = version
    await writeFile(context.filesPath[index], packageJSON, { spaces: 2 })
  }

  await gitSyncSave(
    version as string,
    context.options.version.commitMessage,
  )
}
export async function handleDiffVersion (context: Context) {
  const triggerSign: SetAnalysisBlockObject = new Set()
  await context.forDiffPack(async function (analysisBlock, dir) {
    await changeVersionResultItem(context, analysisBlock, dir, triggerSign)
  }, 'v')
  await writeJSONs(triggerSign)
  await gitDiffSave(
    [...triggerSign].map(({ packageJSON }) => {
      return `${packageJSON.name as string}@${packageJSON.version}`
    }),
    context.options.version.commitMessage,
  )
}
export async function changeVersionResultItem (
  context: Context,
  analysisBlock: AnalysisBlockObject,
  dir: string,
  triggerSign: SetAnalysisBlockObject,
) {
  const { packageJSON, filePath } = analysisBlock

  if (triggerSign.has(analysisBlock)) return
  triggerSign.add(analysisBlock)

  const oldVersion = packageJSON.version
  console.log(colors.white.bold(`package: ${packageJSON.name}`))
  const version = await changeVersion(filePath, dir)

  if (version !== oldVersion) {
    packageJSON.version = version
    await changeDiffRelyMyDirItem(context, analysisBlock, triggerSign)
  }
}
export async function changeDiffRelyMyDirItem (
  context: Context,
  analysisBlock: AnalysisBlockObject,
  triggerSign: SetAnalysisBlockObject,
) {
  const versionRegExp = new RegExp(versionText)
  const relyAttrs = getRelyAttrs().reverse()
  const name = analysisBlock.packageJSON.name as string
  const relyMyDir = analysisBlock.relyMyDir

  for (let i = 0; i < relyMyDir.length; i++) {
    const relyDir = relyMyDir[i]
    const analysisBlockRelyMyDir = context.contextAnalysisDiagram[relyDir]
    const packageJSON = analysisBlockRelyMyDir.packageJSON
    const relyAttr = relyAttrs.find(key => packageJSON[key][name]) as string

    packageJSON[relyAttr][name] =
      packageJSON[relyAttr][name]
        .replace(versionRegExp, analysisBlock.packageJSON.version)

    if (!triggerSign.has(analysisBlockRelyMyDir)) {
      await changeVersionResultItem(
        context,
        analysisBlockRelyMyDir,
        relyDir,
        triggerSign,
      )
    }
  }
}
export function writeJSONs (
  triggerSign: SetAnalysisBlockObject,
) {
  return Promise.all([...triggerSign].map(({ filePath, packageJSON }) => {
    return writeFile(filePath, packageJSON, { spaces: 2 })
  }))
}
export async function changeVersion (packagePath: string, cwd?: string) {
  const command = 'npx bumpp'
  execSync(command, {
    stdio: 'inherit',
    cwd: fixCWD(cwd),
  })

  const { version } = await readFile(packagePath) as IPackageJson
  return version
}
