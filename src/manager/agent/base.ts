import type IPackageJson from '@ts-type/package-dts'
import type { Options } from 'execa'
import type { Manager } from '../type'
import type { CommandResult } from '../../command'
import { createPublishCommand } from '../../instruct'

export class BaseManager implements Manager {
  agent = 'base'
  async getConfig () {
    return {}
  }

  async publish (packageJson: IPackageJson<any>, args: string[] = [], options: Options = {}): Promise<CommandResult> {
    return createPublishCommand(packageJson.version as string, {
      agent: this.agent,
      args,
      options,
    })
  }
}
