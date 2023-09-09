import type IPackageJson from '@ts-type/package-dts'
import type { Options } from 'execa'
import type { Manager } from '../type'
import type { CommandResult } from '../../command'
import { npmTag } from '../../utils/regExp'

export class BaseManager implements Manager {
  agent = 'base'
  async getConfig () {
    return {}
  }

  async publish (packageJson: IPackageJson<any>, args: string[] = [], options: Options = {}): Promise<CommandResult> {
    const _options: Options = { stdio: 'inherit', ...options }
    const _args: string[] = [...args]
    const argTag = '--tag'
    if (_args.every(arg => arg !== argTag) && packageJson.version) {
      const tagArr = packageJson.version.match(new RegExp(npmTag))
      if (tagArr) {
        _args.push(argTag, tagArr[1])
      }
    }
    return {
      agent: this.agent,
      args: _args,
      options: _options,
    }
  }
}
