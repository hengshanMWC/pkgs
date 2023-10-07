import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Agent } from '../../constant'
import { getJSON } from '../../utils'
import type { ExecuteCommandCli } from '../../defaultOptions'
import { BaseManager } from './base'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export class YarnManager extends BaseManager {
  agent = Agent.YARN

  async getConfig(): Promise<ExecuteCommandCli> {
    try {
      const packageJson = await getJSON(resolve(__dirname, './package.json'))
      if (packageJson?.workspaces) {
        return {
          packagesPath: packageJson.workspaces,
        }
      }
      return {}
    }
    catch {
      return {}
    }
  }
}
