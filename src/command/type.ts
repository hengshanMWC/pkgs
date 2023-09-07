import type { Context } from '../lib'

export interface PluginData<T extends any[] = any[]> {
  id: string
  command: string
  description: string
  option?: PluginOption[]
  action: (context: Context, ...args: T) => void
}

export type PluginOption = [flags: string, description?: string, defaultValue?: string | boolean]

export interface Commands {
  command: string,
  args: string[],
  cwd: string
}

export * from './version/type'
export * from './publish/type'
export * from './run/type'
