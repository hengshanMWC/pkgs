import type { DefaultParams, GetConfig } from '../../defaultOptions'

export type RunMode = 'work' | 'stage' | 'repository'
export interface CommandRunOption extends DefaultParams {
  type: RunMode
}

export type CommandRunParams = Partial<CommandRunOption>

export type CommandRunConfig = GetConfig<CommandRunOption>
