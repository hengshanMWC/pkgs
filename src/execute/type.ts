import type { Options } from 'execa'
import type { AgentType } from '../command'

export interface Execute {
  inputAgent: AgentType
  inputCommand: string
  inputOptions?: Options
  inputArgs: string[]
  outAgentList: AgentType[]
  outCommandList: string[]
  outOptionsList?: Options[]
  outArgsList: string[][]
  setOutData(commandList: string[], optionsList?: Options[]): this
  run (): any
}
