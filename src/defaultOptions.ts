import { createInitPlugin, createRunPlugin, createTagPlugin, createVersionPlugin, createPublishPlugin } from './command'
import type { Context } from './lib/context'
type Type = 'sync' | 'diff'
interface ExecuteCommandOption {
  mode: Type
}

type PluginOption = [flags: string, description?: string, defaultValue?: string | boolean]
export interface PluginData {
  id: string
  command: string
  description: string
  option?: PluginOption[]
  action: (context: Context, ...args: any[]) => void
}
interface ExecuteCommandVersionOption extends
  Partial<ExecuteCommandOption> {
  message?: string
}
interface ExecuteCommandPublishOption extends
  Partial<ExecuteCommandOption> {
  tag?: string
}
export interface ExecuteCommandConfing extends ExecuteCommandOption {
  packagesPath: string | string[] | undefined
  rootPackage: Boolean
  version: ExecuteCommandVersionOption
  publish: ExecuteCommandPublishOption
  plugin: Array<PluginData | string>
}
export const defaultOptions: ExecuteCommandConfing = {
  packagesPath: undefined,
  rootPackage: true,
  mode: 'sync',
  version: {
    mode: undefined,
    message: 'chore: version',
  },
  publish: {
    mode: undefined,
    tag: '',
  },
  plugin: [
    createVersionPlugin(),
    createPublishPlugin(),
    createRunPlugin(),
    createInitPlugin(),
    createTagPlugin(),
  ],
}
