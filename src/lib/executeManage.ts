import type { HandleMainResult } from '../plugin'
import { WARN_NOW_RUN } from '../constant'
import { BaseExecuteManage } from '../execute'
import {
  warn,
} from '../utils'
import type { AnalysisBlockItem, ExecuteApi } from '.'

export class Execute implements ExecuteApi {
  private manage = new BaseExecuteManage()
  private affectedAnalysisBlockList: AnalysisBlockItem[] = []

  enterMainResult(commandMainResult: HandleMainResult) {
    this
      .setAffectedAnalysisBlockList(commandMainResult.analysisBlockList)
      .manage
      .pushTask(...commandMainResult.taskList)
    return this
  }

  private setAffectedAnalysisBlockList(analysisBlockLis: AnalysisBlockItem[]) {
    this.affectedAnalysisBlockList = analysisBlockLis
    return this
  }

  getCommandData() {
    return {
      analysisBlockList: this.affectedAnalysisBlockList,
      commandData: this.manage.getCommandData(),
    }
  }

  async execute() {
    const result = await this.manage.execute()
    if (!result.length)
      warn(WARN_NOW_RUN)

    return result
  }
}
