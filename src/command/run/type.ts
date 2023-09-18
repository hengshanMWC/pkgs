import type { DefaultParams } from '../../defaultOptions'

export type RunMode = 'all' | 'work' | 'stage' | 'repository'
export interface CommandRunOption {
  type?: RunMode
}

export type CommandRunParams = CommandRunOption & Partial<Exclude<DefaultParams, 'mode'>>
