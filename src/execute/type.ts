import type { Options } from 'execa'
import type { AgentType } from '../command'

export interface Execute {
  readonly inputAgent: AgentType
  readonly inputCommand: string
  readonly inputOptions: Options
  readonly inputArgs: string[]
  readonly outAgentList: AgentType[]
  readonly outCommandList: string[]
  readonly outOptionsList: Options[]
  readonly outArgsList: string[][]
  setOutData(commandList: string[], optionsList: Options[]): this
  run (): any
}
