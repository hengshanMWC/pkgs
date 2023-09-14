import type { CommandResult } from '../command'
import type { AnalysisBlockItem } from '../lib'

export interface Execute {
  inputCommandData: CommandResult
  outCommandDataList: CommandResult[]
  setOutData(outCommandDataList: CommandResult[]): this
  outRun (): any
}

export interface ExecuteManage<T = any> extends ExecuteTaskFunc<CommandResult<T>[]> {
  taskGroup: ExecuteTaskFunc<any>[]
  pushTask(tasks: ExecuteTask): this
}

export interface ExecuteTask<T = CommandResult> extends ExecuteTaskFunc<T>{
  commandData: T
}

export interface ExecuteTaskFunc<T> {
  getCommandData (): T
  run (): Promise<any>
}
export interface FileExecuteCommandResult extends CommandResult<AnalysisBlockItem> {
  args: AnalysisBlockItem
}
