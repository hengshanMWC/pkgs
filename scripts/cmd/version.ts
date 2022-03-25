import { execSync } from 'child_process'
import { readFile, writeFile } from 'jsonfile'
import type { IPackageJson } from '@ts-type/package-dts'
import colors from 'colors'
import { gitSyncSave, gitDiffSave } from '../git'
import type { Context, AnalysisDiagramObject } from '../index'
import { versionText } from '../utils/regExp'
import { getRelyAttrs } from '../utils/analysisDiagram'
export type SetAnalysisDiagramObject = Set<AnalysisDiagramObject>
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
  const triggerSign: SetAnalysisDiagramObject = new Set()
  await changeVersionResult(context, triggerSign)
  await writeJSONs(triggerSign)
  await gitDiffSave(
    [...triggerSign].map(({ packageJSON }) => {
      return `${packageJSON.name as string}@${packageJSON.version}`
    }),
    context.options.version.commitMessage,
  )
}
export async function changeVersionResult (
  context: Context,
  triggerSign: SetAnalysisDiagramObject,
) {
  await context.forDiffPack(async function (analysisDiagram, dir) {
    await changeVersionResultItem(context, analysisDiagram, dir, triggerSign)
  }, 'v')
}
export async function changeVersionResultItem (
  context: Context,
  analysisDiagram: AnalysisDiagramObject,
  dir: string,
  triggerSign: SetAnalysisDiagramObject,
) {
  const { packageJSON, filePath } = analysisDiagram

  if (triggerSign.has(analysisDiagram)) return
  triggerSign.add(analysisDiagram)

  const oldVersion = packageJSON.version
  console.log(colors.white.bold(`package: ${packageJSON.name}`))
  const version = await changeVersion(filePath, dir)

  if (version !== oldVersion) {
    packageJSON.version = version
    await changeDiffRelyMyItem(context, analysisDiagram, triggerSign)
  }
}
// export async function changeDiffRelyMy (
//   context: Context,
//   changePackages: AnalysisDiagramObject[],
//   triggerSign: SetAnalysisDiagramObject,
// ) {
//   changePackages.forEach(async analysisDiagram => {
//     await changeDiffRelyMyItem(context, analysisDiagram, triggerSign)
//   })
// }
export async function changeDiffRelyMyItem (
  context: Context,
  analysisDiagram: AnalysisDiagramObject,
  triggerSign: SetAnalysisDiagramObject,
) {
  const versionRegExp = new RegExp(versionText)
  const relyAttrs = getRelyAttrs().reverse()
  const name = analysisDiagram.packageJSON.name as string
  const relyMy = analysisDiagram.relyMy

  for (let i = 0; i < relyMy.length; i++) {
    const relyDir = relyMy[i]
    const analysisDiagramRelyMy = context.contextAnalysisDiagram[relyDir]
    const packageJSON = analysisDiagramRelyMy.packageJSON
    const relyAttr = relyAttrs.find(key => packageJSON[key][name]) as string

    packageJSON[relyAttr][name] =
      packageJSON[relyAttr][name]
        .replace(versionRegExp, analysisDiagram.packageJSON.version)

    if (!triggerSign.has(analysisDiagramRelyMy)) {
      await changeVersionResultItem(
        context,
        analysisDiagramRelyMy,
        relyDir,
        triggerSign,
      )
    }
  }
}
export function writeJSONs (
  triggerSign: SetAnalysisDiagramObject,
) {
  return Promise.all([...triggerSign].map(({ filePath, packageJSON }) => {
    return writeFile(filePath, packageJSON, { spaces: 2 })
  }))
}
export async function changeVersion (packagePath: string, dir?: string) {
  const cdDir = dir ? `cd ${dir} && ` : ''
  execSync(`${cdDir}npx bumpp`, { stdio: 'inherit' })

  const { version } = await readFile(packagePath) as IPackageJson
  return version
}
