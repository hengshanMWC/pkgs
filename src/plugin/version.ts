import type { PluginData } from '../defaultOptions'

export {
  versionPlugin,
}
const versionPlugin: PluginData = {
  id: 'mwc',
  description: 'mwc test',
  option: [
    ['--mode <type>', 'sync | diff'],
    ['-m, --message <message>', 'commit message'],
  ],
  action () {
    console.log('mwc')
  },
}
