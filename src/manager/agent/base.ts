import type { IPackageJson } from '@ts-type/package-dts'
import type { Options } from 'execa'
import type { ManagerApi } from '../type'
import type { CommandResult } from '../../plugin'
import { createCommand, createPublishCommand } from '../../instruct'

export class BaseManager implements ManagerApi {
  agent = 'base'
  async getConfig() {
    return {}
  }

  run(cmd: string, args: string[] = [], options?: Options) {
    return createCommand(this.agent, ['run', cmd, ...args], options)
  }

  publish(packageJson: IPackageJson<any>, args: string[] = [], options: Options = {}): CommandResult {
    return createPublishCommand(packageJson.version as string, {
      agent: this.agent,
      args,
      options,
    })
  }
}
