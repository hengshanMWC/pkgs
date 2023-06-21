import { createInitPlugin, createRunPlugin, createVersionPlugin, createPublishPlugin } from './command'
import type { Context } from './lib/context'
type Type = 'sync' | 'diff'
interface ExecuteCommandOption {
  mode: Type
}

type PluginOption = [flags: string, description?: string, defaultValue?: string | boolean]
export interface PluginData<T extends any[] = any[]> {
  id: string
  command: string
  description: string
  option?: PluginOption[]
  action: (context: Context, ...args: T) => void
}
interface ExecuteCommandVersionOption extends
  Partial<ExecuteCommandOption> {
  message?: string
}
interface ExecuteCommandPublishOption extends
  Partial<ExecuteCommandOption> {
  tag?: string
}
export interface ExecuteCommandConfig extends ExecuteCommandOption {
  packagesPath: string | string[] | undefined
  version: ExecuteCommandVersionOption
  publish: ExecuteCommandPublishOption
  plugins: Array<PluginData | string>
}
export const defaultOptions: ExecuteCommandConfig = {
  packagesPath: undefined,
  mode: 'sync',
  version: {
    mode: undefined,
    message: 'chore: version',
  },
  publish: {
    mode: undefined,
    tag: '',
  },
  plugins: [
    createVersionPlugin(),
    createPublishPlugin(),
    createRunPlugin(),
    createInitPlugin(),
  ],
}
