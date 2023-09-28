import type { Options } from 'execa'
import type { AnalysisBlockItem, Context } from '../lib'
import type { Agent } from '../constant'
import type { TaskItem } from '../execute'

export interface BasePluginData<T extends any[] = any> {
  id: string
  command: string
  description: string
  options?: PluginOption[]
  allowUnknownOption?: boolean
  action: (context: Context, ...args: T) => void
}
export type PluginData = Readonly<BasePluginData>

export type PluginOption = readonly [flags: string, description?: string, defaultValue?: string | boolean]

export type AgentType = Agent | string

export interface CommandParams<T = string[]> {
  args: T
  options?: Options
}

export interface CommandResult<T = string[]> extends CommandParams<T> {
  agent: AgentType
}

export interface CommandMainResult {
  analysisBlockList: AnalysisBlockItem[]
  commandList: CommandResult[]
}

export interface GitCommandMainResult extends CommandMainResult {
  gitCommandList: CommandResult[]
}

export interface ExecuteCommandResult<T = any> extends CommandMainResult {
  executeResult: T[]
}

export interface HandleMainResult {
  analysisBlockList: AnalysisBlockItem[]
  taskList: TaskItem[]
}

export * from './version/type'
export * from './publish/type'
export * from './run/type'
