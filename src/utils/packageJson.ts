import type { AnalysisBlockObject } from '../index'
import { getRelyAttrs } from './analysisDiagram'
import { versionText } from './regExp'
export function dependentSearch (
  analysisBlock: AnalysisBlockObject,
  analysisBlockRelyMy: AnalysisBlockObject,
) {
  const name = analysisBlock.packageJson.name as string
  const packageJson = analysisBlockRelyMy.packageJson
  const relyAttrs = getRelyAttrs().reverse()
  const versionRegExp = new RegExp(versionText)
  const relyAttr = relyAttrs.find(key => packageJson[key][name]) as string

  packageJson[relyAttr][name] =
      packageJson[relyAttr][name]
        .replace(versionRegExp, analysisBlock.packageJson.version)
}
