import { PluginStore } from '../../src/index'
import { createTestPlugin } from '../__fixtures__/plugin'

const cmd = 'plugin'

describe(cmd, () => {
  test('default', async () => {
    const pluginStore = new PluginStore()
    pluginStore.add(createTestPlugin)
    expect(pluginStore.map.get('test')).toMatchObject(createTestPlugin())
  })
})
