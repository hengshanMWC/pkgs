import type { DefaultParams } from '../../defaultOptions'

export interface CommandVersionOption {
  message?: string
}

export type CommandVersionParams = CommandVersionOption & Partial<DefaultParams>
