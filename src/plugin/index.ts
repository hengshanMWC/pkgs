import type { PluginData } from '../defaultOptions'
export {
  PluginStore,
}

class PluginStore {
  map: Map<string, PluginData> = new Map()

  use (plugin: PluginData) {
    if (this.map.has(plugin.id)) {
      console.log('有重复的plugin id')
    }
    else {
      this.map.set(plugin.id, plugin)
    }
    return this
  }

  async readUse (route: string) {
    const plugin = await import(route)
    return this.use(plugin)
  }

  remove (id: string) {
    this.map.delete(id)
  }
}
