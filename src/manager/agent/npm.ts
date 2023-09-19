import { Agent } from '../../constant'
import { YarnManager } from './yarn'

export class NpmManager extends YarnManager {
  agent = Agent.NPM
}
