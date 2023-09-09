import { getYamlPackages } from '../../utils'
import { DEFAULT_AGENT } from '../../constant'
import { BaseManager } from './base'

export class PnpmManager extends BaseManager {
  agent = DEFAULT_AGENT

  async getConfig () {
    try {
      const packagesPath = await getYamlPackages()
      return {
        packagesPath,
      }
    }
    catch {
      return {}
    }
  }
}
