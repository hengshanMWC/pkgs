import type { Options } from 'execa'
import type { AnalysisBlockItem, Context } from '../lib'
import type { Agent } from '../constant'

export interface PluginData<T extends any[] = any> {
  id: string
  command: string
  description: string
  option?: PluginOption[]
  action: (context: Context, ...args: T) => void
}

export type PluginOption = [flags: string, description?: string, defaultValue?: string | boolean]

export type AgentType = Agent | string

export interface CommandParams<T> {
  args?: T
  options?: Options
}

export interface CommandResult<T = string[]> extends CommandParams<T> {
  agent: AgentType
}

export interface CommandMainResult {
  analysisBlockList: AnalysisBlockItem[]
  commandList: CommandResult[]
}

export interface ExecuteCommandResult<T = any> extends CommandMainResult {
  executeResult: T[]
}

export * from './version/type'
export * from './publish/type'
export * from './run/type'
