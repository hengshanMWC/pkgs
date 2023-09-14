import { execa } from 'execa'
import { writeJSON } from 'fs-extra'
import type { Execute, ExecuteManage, ExecuteTask, ExecuteTaskFunc, FileExecuteCommandResult } from '../type'
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

export class BaseExecuteManage implements ExecuteManage {
  taskGroup: ExecuteTaskFunc<any>[] = []

  get existTask () {
    return !!this.taskGroup.length
  }

  pushTask (task: ExecuteTask): this {
    this.taskGroup.push(task)
    return this
  }

  getCommandData () {
    return this.taskGroup.map(task => {
      return task.getCommandData()
    })
  }

  run () {
    return Promise.all(this.taskGroup.map(task => {
      return task.getCommandData()
    }))
  }
}

export class BaseExecuteTask implements ExecuteTask {
  commandData: CommandResult
  constructor (commandData: CommandResult) {
    this.commandData = commandData
  }

  getCommandData (): CommandResult {
    return this.commandData
  }

  run () {
    const { agent, args, options } = this.commandData
    return execa(agent, args, options)
  }
}

export class FileExecuteTask implements ExecuteTask<FileExecuteCommandResult> {
  commandData: FileExecuteCommandResult
  constructor (commandData: FileExecuteCommandResult) {
    this.commandData = commandData
  }

  getCommandData () {
    return this.commandData
  }

  run () {
    const { args, options } = this.commandData
    return writeJSON(
      args.filePath,
      options?.cwd || args.packageJson,
      { spaces: 2 },
    )
  }
}
