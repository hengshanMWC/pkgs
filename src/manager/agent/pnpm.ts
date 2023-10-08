import { Agent } from '../../constant'
import { getYamlPackages } from '../../utils'
import { BaseManager } from './base'

export class PnpmManager extends BaseManager {
  agent = Agent.PNPM

  async getConfig() {
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
