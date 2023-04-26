import type { ExecuteCommandOptions, PluginData } from './defaultOptions'
export {
  PluginStore,
}

class PluginStore {
  map: Map<string, PluginData> = new Map()

  add (plugin: PluginData) {
    if (this.map.has(plugin.id)) {
      console.log('有重复的plugin id')
    }
    else {
      this.map.set(plugin.id, plugin)
    }
    return this
  }

  async readAdd (route: string) {
    const plugin = await import(route)
    return this.add(plugin)
  }

  async use (...plugins: Required<ExecuteCommandOptions>['plugin']) {
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      if (typeof plugin === 'string') {
        await this.readAdd(plugin)
      }
      else {
        this.add(plugin)
      }
    }
  }

  remove (id: string) {
    this.map.delete(id)
  }
}
