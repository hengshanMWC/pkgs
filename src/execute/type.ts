import type { CommandResult } from '../command'
import type { AnalysisBlockItem } from '../lib'
export interface ExecuteManage<T = CommandResult<any>> extends ExecuteTaskFunc<T[]> {
  taskGroup: (ExecuteTaskFunc<T> | ExecuteManage<T>)[]
  pushTask(tasks: ExecuteTask): this
  serialRun (): Promise<any>
}

export interface ExecuteTask<T = CommandResult> extends ExecuteTaskFunc<T>{
  commandData: T
}

export interface ExecuteTaskFunc<T = CommandResult<any>> {
  getCommandData (): T
  run (): Promise<any>
}
export interface FileExecuteCommandResult extends CommandResult<AnalysisBlockItem> {
  args: AnalysisBlockItem
}
