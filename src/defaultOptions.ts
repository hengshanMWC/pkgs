import type { Context } from '.'

type Type = 'sync' | 'diff'
interface ExecuteCommandOption {
  mode: Type
}
export interface PluginData {
  id: string
  description: string
  option?: string[][]
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
  plugin?: PluginData[]
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
  plugin: [],
}
