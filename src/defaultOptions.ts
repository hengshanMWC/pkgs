import { createInitPlugin, createPublishPlugin, createRunPlugin, createVersionPlugin } from './plugin'
import type { CommandPublishParams } from './plugin/publish/type'
import type { CommandRunParams } from './plugin/run/type'
import type { PluginData } from './plugin/type'
import type { CommandVersionParams } from './plugin/version/type'
import { Mode } from './constant'

export interface DefaultParams {
  mode: Mode
  push: boolean
}

export type GetConfig<T extends DefaultParams> = Omit<T, keyof DefaultParams>

export interface ExecuteCommandConfig extends DefaultParams {
  packagesPath: string | string[] | undefined
  version: CommandVersionParams
  publish: CommandPublishParams
  run: CommandRunParams
  plugins: Array<(() => PluginData) | PluginData | string>
}

export type ExecuteCommandCli = DeepPartial<ExecuteCommandConfig>
export const defaultOptions: ExecuteCommandConfig = {
  packagesPath: undefined,
  mode: Mode.SYNC,
  push: true,
  version: {
    message: 'chore: version %s',
  },
  publish: {},
  run: {
    type: 'all',
    DAG: true,
  },
  plugins: [
    createVersionPlugin,
    createPublishPlugin,
    createRunPlugin,
    createInitPlugin,
  ],
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}

export function defineConfig(config: ExecuteCommandCli = {}): ExecuteCommandCli {
  return config
}
