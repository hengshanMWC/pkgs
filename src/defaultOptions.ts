import { createInitPlugin, createRunPlugin, createVersionPlugin, createPublishPlugin } from './command'
import type { CommandPublishConfig } from './command/publish/type'
import type { CommandRunConfig } from './command/run/type'
import type { PluginData } from './command/type'
import type { CommandVersionConfig } from './command/version/type'
export type Mode = 'sync' | 'diff'

export interface DefaultParams {
  mode: Mode
}

export type GetConfig<T extends DefaultParams> = Omit<T, 'mode'>

export interface ExecuteCommandConfig extends DefaultParams {
  packagesPath: string | string[] | undefined
  version: CommandVersionConfig
  publish: CommandPublishConfig
  run: CommandRunConfig
  plugins: Array<PluginData | string>
}

export type ExecuteCommandCli = DeepPartial<ExecuteCommandConfig>

export const defaultOptions: ExecuteCommandConfig = {
  packagesPath: undefined,
  mode: 'sync',
  version: {
    message: 'chore: version %s',
  },
  publish: {
    message: 'release %s',
    access: 'public'
  },
  run: {
    type: 'all',
  },
  plugins: [
    createVersionPlugin(),
    createPublishPlugin(),
    createRunPlugin(),
    createInitPlugin(),
  ],
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}
