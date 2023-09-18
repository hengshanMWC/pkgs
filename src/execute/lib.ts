import { execa } from 'execa'
import { access, copyFile, mkdir, stat, writeJSON } from 'fs-extra'
import type { SimpleGit } from 'simple-git'
import type { CommandResult } from '../command'
import { Agent } from '../constant'
import type {
  CopyFileExecuteCommandData,
  CopyFileExecuteCommandResult,
  ExecuteCommandData,
  ExecuteManage,
  ExecuteTask,
  FileExecuteCommandData,
  FileExecuteCommandResult,
  TaskItem,
} from './type'

export class BaseExecuteManage implements ExecuteManage {
  taskGroup: TaskItem[] = []

  get existTask () {
    return !!this.taskGroup.length
  }

  pushTask (...task: TaskItem[]): this {
    this.taskGroup.push(...task)
    return this
  }

  getCommandData () {
    const commandData: CommandResult<any>[] = []
    this.taskGroup.forEach(task => {
      const data = task.getCommandData()
      if (Array.isArray(data)) {
        commandData.push(...data)
      }
      else {
        commandData.push(data)
      }
    })
    return commandData
  }

  execute () {
    return Promise.all(this.taskGroup.map(task => {
      return task.execute()
    }))
  }
}

export class SerialExecuteManage extends BaseExecuteManage {
  async execute () {
    const result = []
    for (const task of this.taskGroup) {
      result.push(await task.execute())
    }
    return result
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

  execute () {
    const { agent, args, options } = this.commandData
    return execa(agent, args, options)
  }
}

export class JsonExecuteTask implements ExecuteTask<FileExecuteCommandResult> {
  commandData: FileExecuteCommandResult
  constructor (commandData: FileExecuteCommandData) {
    this.commandData = {
      agent: Agent.PKGS,
      ...commandData,
    }
  }

  getCommandData () {
    return this.commandData
  }

  execute () {
    const { args, options } = this.commandData
    return writeJSON(
      args.filePath,
      options?.cwd || args.packageJson,
      { spaces: 2 },
    )
  }
}

export class GitExecuteTask implements ExecuteTask {
  commandData: CommandResult
  git: SimpleGit
  constructor (commandData: ExecuteCommandData, git: SimpleGit) {
    this.commandData = {
      agent: Agent.GIT,
      ...commandData,
    }
    this.git = git
  }

  getCommandData () {
    return this.commandData
  }

  execute () {
    const { args } = this.commandData
    return this.git.raw(args)
  }
}

export class CopyFileExecuteTask implements ExecuteTask<CopyFileExecuteCommandResult> {
  commandData: CopyFileExecuteCommandResult
  constructor (commandData: CopyFileExecuteCommandData) {
    this.commandData = {
      agent: Agent.PKGS,
      ...commandData,
    }
  }

  getCommandData () {
    return this.commandData
  }

  async execute () {
    const { args, options } = this.commandData
    const dir = args[0]
    try {
      await access(dir)
    }
    catch {
      await copyFile(options.cwd, dir)
    }
  }
}

export class MkdirExecuteTask implements ExecuteTask {
  commandData: CommandResult
  constructor (commandData: ExecuteCommandData) {
    this.commandData = {
      agent: Agent.PKGS,
      ...commandData,
    }
  }

  getCommandData () {
    return this.commandData
  }

  async execute () {
    const { args } = this.commandData
    const dir = args[0]
    try {
      const statResult = await stat(dir)
      if (!statResult.isDirectory()) {
        throw new Error()
      }
      return statResult
    }
    catch {
      await mkdir(dir)
    }
  }
}
