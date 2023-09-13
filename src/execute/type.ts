import type { CommandResult } from '../command'

export interface Execute {
  inputCommandData: CommandResult
  outCommandDataList: CommandResult[]
  setOutData(outCommandDataList: CommandResult[]): this
  outRun (): any
}
