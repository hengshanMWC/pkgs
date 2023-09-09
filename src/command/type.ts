import type { Options } from 'execa'
import type { Context } from '../lib'

export interface PluginData<T = any> {
  id: string
  command: string
  description: string
  option?: PluginOption[]
  action: (context: Context, args: T) => void
}

export type PluginOption = [flags: string, description?: string, defaultValue?: string | boolean]

export enum Agent {
  PNPM = 'pnpm',
}

export type AgentType = Agent | string

export interface CommandResult {
  agent: AgentType
  args: string[]
  options: Options
}

export * from './version/type'
export * from './publish/type'
export * from './run/type'
