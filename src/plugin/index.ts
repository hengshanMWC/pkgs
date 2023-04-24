import type { ExecuteCommandOptions } from '../defaultOptions'
export {
  Plugin,
}
interface PluginData {
  command: string
  description: string
  option?: string[]
  action: string
}
class Plugin {
  options: ExecuteCommandOptions
  list: PluginData[]
  constructor () {

  }

  register () {

  }
}
