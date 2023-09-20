import { cliMain } from '../../src/index'
import { originVersion } from '../__fixtures__/constant'

const cmd = 'cli'

describe(cmd, () => {
  test('default', async () => {
    await cliMain(['', '', 'run', 'test:bin-i'], originVersion)
    await cliMain(['', '', 'run', 'test:bin-i'], originVersion)
  }, 100000000)
})
