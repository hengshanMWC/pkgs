import type { PluginData } from '../defaultOptions'

export {
  testPlugin,
}
const testPlugin: PluginData = {
  id: 'mwc <cmd> [test]',
  description: 'mwc test',
  option: [
    ['--mode <type>', 'sync | diff'],
    ['-m, --message <message>', 'commit message'],
  ],
  action () {
    console.log('mwc')
  },
}
