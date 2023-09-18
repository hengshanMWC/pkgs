import type IPackageJson from '@ts-type/package-dts'
import type { Options } from 'execa'
import type { Manager } from '../type'
import type { CommandResult } from '../../command'
import { createCommand, createPublishCommand } from '../../instruct'

export class BaseManager implements Manager {
  agent = 'base'
  async getConfig () {
    return {}
  }

  async run (cmd: string, args: string[] = []) {
    return createCommand(this.agent, ['run', cmd, ...args])
  }

  publish (packageJson: IPackageJson<any>, args: string[] = [], options: Options = {}): CommandResult {
    return createPublishCommand(packageJson.version as string, {
      agent: this.agent,
      args,
      options,
    })
  }
}
