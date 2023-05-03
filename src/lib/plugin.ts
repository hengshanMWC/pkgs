export {
  PluginStore,
}
type CreatePluginData<T> = () => T
class PluginStore<T extends { id: any }> {
  map: Map<string, T> = new Map()

  add (plugin: T | CreatePluginData<T>) {
    const pluginData: T = typeof plugin === 'function' ? plugin() : plugin
    if (this.map.has(pluginData.id)) {
      console.log('有重复的plugin id')
    }
    else {
      this.map.set(pluginData.id, pluginData)
    }
    return this
  }

  async readAdd (route: string) {
    const plugin = await import(route)
    return this.add(plugin)
  }

  async use (...plugins: Array<T | string>) {
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
