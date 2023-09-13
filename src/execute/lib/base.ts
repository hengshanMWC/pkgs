import { execa } from 'execa'
import type { Execute } from '../type'
import type { CommandResult } from '../../command'

export class BaseExecute implements Execute {
  inputCommandData: CommandResult
  outCommandDataList: CommandResult[] = []
  constructor (inputCommandData: CommandResult) {
    this.inputCommandData = inputCommandData
  }

  setOutData (outCommandData: CommandResult[]) {
    this.outCommandDataList = outCommandData
    return this
  }

  outRun () {
    const runList = this.outCommandDataList.map(data => {
      return execa(data.agent, data.args, data.options)
    })
    return Promise.all(runList)
  }
}
