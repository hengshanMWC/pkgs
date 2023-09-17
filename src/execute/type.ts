import type { AgentType, CommandResult } from '../command'
import type { AnalysisBlockItem } from '../lib'
export interface ExecuteManage<T = CommandResult<any>> extends ExecuteTaskFunc<T[]> {
  taskGroup: (ExecuteTaskFunc<T> | ExecuteManage<T>)[]
  pushTask(tasks: ExecuteTask): this
}

export interface ExecuteTask<T = CommandResult> extends ExecuteTaskFunc<T>{
  commandData: T
}

export interface ExecuteTaskFunc<T = CommandResult<any>> {
  getCommandData (): T
  run (): Promise<any>
}

export type AgentNoNeed<T> = Omit<T, 'agent'> & {
  agent?: AgentType
}

export interface FileExecuteCommandResult extends CommandResult<AnalysisBlockItem> {
  args: AnalysisBlockItem
}

export interface CopyFileExecuteCommandResult extends CommandResult<string> {
  args: string
  options: {
    cwd: string
  }
}

export interface MkdirExecuteCommandResult extends CommandResult<string> {
  args: string
}

export type FileExecuteCommandData = AgentNoNeed<FileExecuteCommandResult>

export type ExecuteCommandData = AgentNoNeed<CommandResult>

export type CopyFileExecuteCommandData = AgentNoNeed<CopyFileExecuteCommandResult>

export type MkdirExecuteCommandData = AgentNoNeed<MkdirExecuteCommandResult>

export type TaskItem = ExecuteTaskFunc | ExecuteManage
