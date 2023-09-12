import { execaCommand, type Options } from 'execa'
import type { Execute } from '../type'

export class BaseExecute implements Execute {
  inputCommand: string
  inputOptions: Options
  outCommandList: string[] = []
  outOptionsList: Options[] = []
  constructor (command: string, options: Options) {
    this.inputCommand = command
    this.inputOptions = options
  }

  get inputAgent () {
    return this.inputCommand.split(' ')[0]
  }

  get outAgentList () {
    return this.outCommandList.map(command => command.split(' ')[0])
  }

  get inputArgs () {
    return this.inputCommand.split(' ').slice(1)
  }

  get outArgsList () {
    return this.outCommandList.map(command => command.split(' ').slice(1))
  }

  setOutData (commandList: string[], optionsList: Options[]) {
    this.outCommandList = commandList
    this.outOptionsList = optionsList
    return this
  }

  run () {
    const runList = this.outCommandList.map((command, index) => {
      return execaCommand(command, this.outOptionsList[index])
    })
    return Promise.all(runList)
  }
}
