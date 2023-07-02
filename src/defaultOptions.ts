import { createInitPlugin, createRunPlugin, createVersionPlugin, createPublishPlugin } from './command'
import type { Context } from './lib/context'
type Type = 'sync' | 'diff'

type PluginOption = [flags: string, description?: string, defaultValue?: string | boolean]
export interface PluginData<T extends any[] = any[]> {
  id: string
  command: string
  description: string
  option?: PluginOption[]
  action: (context: Context, ...args: T) => void
}
export interface ExecuteCommandVersionOption {
  mode?: Type
  message?: string
}
export interface ExecuteCommandPublishOption {
  tag?: string
}
export interface ExecuteCommandConfig {
  packagesPath: string | string[] | undefined
  version: ExecuteCommandVersionOption
  // publish: ExecuteCommandPublishOption
  plugins: Array<PluginData | string>
}
export const defaultOptions: ExecuteCommandConfig = {
  packagesPath: undefined,
  version: {
    mode: 'sync',
    message: 'chore: version %s',
  },
  // publish: {
  // tag: '',
  // },
  plugins: [
    createVersionPlugin(),
    createPublishPlugin(),
    createRunPlugin(),
    createInitPlugin(),
  ],
}
