import type { Command } from 'commander'
import { initPlugin } from './cmd'
import type { Context } from './context'
type Type = 'sync' | 'diff'
interface ExecuteCommandOption {
  mode: Type
}
export interface PluginData {
  id: string
  description: string
  option?: Parameters<Command['option']>[]
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
export interface ExecuteCommandOptions extends ExecuteCommandOption {
  packagesPath: string | string[] | undefined
  rootPackage: Boolean
  version: ExecuteCommandVersionOption
  publish: ExecuteCommandPublishOption
  plugin: Array<PluginData | string>
}
export const defaultOptions: ExecuteCommandOptions = {
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
    initPlugin(),
  ],
}
