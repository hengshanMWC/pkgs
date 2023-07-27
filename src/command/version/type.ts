import type { DefaultParams, GetConfig } from '../../defaultOptions'

export interface CommandVersionOption extends DefaultParams {
  message: string
}

export type CommandVersionParams = Partial<CommandVersionOption>

export type CommandVersionConfig = GetConfig<CommandVersionOption>
