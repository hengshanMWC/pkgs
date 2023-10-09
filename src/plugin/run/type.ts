import type { DefaultParams } from '../../defaultOptions'

export type RunMode = 'all' | 'work' | 'stage' | 'repository'
export interface CommandRunOption {
  type?: RunMode
  DAG?: boolean // 拓扑排序
  serial?: boolean // 串行
}

export type CommandRunParams = CommandRunOption & Partial<Exclude<DefaultParams, 'mode'>>
