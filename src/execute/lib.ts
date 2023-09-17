import { execa } from 'execa'
import { access, copyFile, mkdir, stat, writeJSON } from 'fs-extra'
import type { SimpleGit } from 'simple-git'
import { simpleGit } from 'simple-git'
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
  MkdirExecuteCommandData,
  MkdirExecuteCommandResult,
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

  run () {
    return Promise.all(this.taskGroup.map(task => {
      return task.run()
    }))
  }
}

export class SerialExecuteManage extends BaseExecuteManage {
  async run () {
    const result = []
    for (const task of this.taskGroup) {
      result.push(await task.run())
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

  run () {
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

  run () {
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
  constructor (commandData: ExecuteCommandData, git: SimpleGit = simpleGit()) {
    this.commandData = {
      agent: Agent.GIT,
      ...commandData,
    }
    this.git = git
  }

  getCommandData () {
    return this.commandData
  }

  run () {
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

  run () {
    const { args, options } = this.commandData
    try {
      return access(args)
    }
    catch {
      return copyFile(options.cwd, args)
    }
  }
}

export class MkdirExecuteTask implements ExecuteTask<MkdirExecuteCommandResult> {
  commandData: MkdirExecuteCommandResult
  constructor (commandData: MkdirExecuteCommandData) {
    this.commandData = {
      agent: Agent.PKGS,
      ...commandData,
    }
  }

  getCommandData () {
    return this.commandData
  }

  async run () {
    const { args } = this.commandData
    try {
      const statResult = await stat(args)
      if (!statResult.isDirectory()) {
        throw new Error()
      }
      return statResult
    }
    catch {
      return mkdir(args)
    }
  }
}
