import type { AnalysisBlockItem, Context, SetAnalysisBlockObject } from '../../lib'
import { dependentSearch } from '../../utils/packageJson'

export function handleSyncRun (context: Context) {
  const p = handleRun(context)
  return p ?? context.fileStore.repositorySyncFile()
}

export async function handleDiffRun (context: Context) {
  const p = handleRun(context)
  return p ?? context.fileStore.repositoryDiffFile()
}

function handleRun (context: Context) {
  if (context.config.run.type === 'work') {
    return context.fileStore.workDiffFile()
  }
  else if (context.config.run.type === 'stage') {
    return context.fileStore.stageDiffFile()
  }
}

// 升级包
async function changeVersionResultItem (
  context: Context,
  analysisBlock: AnalysisBlockItem,
  triggerSign: SetAnalysisBlockObject,
) {
  if (triggerSign.has(analysisBlock)) return
  triggerSign.add(analysisBlock)
  await changeRelyMyVersion(context, analysisBlock, triggerSign)
}

// 用来升级依赖当前包的包
async function changeRelyMyVersion (
  context: Context,
  analysisBlock: AnalysisBlockItem,
  triggerSign?: SetAnalysisBlockObject,
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
        triggerSign,
      )
    }
  }
}
