import type { DefaultParams } from '../../defaultOptions'

export type RunMode = 'all' | 'work' | 'stage' | 'repository'
export interface CommandRunOption {
  type?: RunMode,
  DAG?: boolean // 关闭拓扑排序
}

export type CommandRunParams = CommandRunOption & Partial<Exclude<DefaultParams, 'mode'>>
