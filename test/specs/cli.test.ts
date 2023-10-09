import { access, stat } from 'fs-extra'
import { Agent, cliMain } from '../../src/index'
import { io } from '../__fixtures__'

const ORIGINAL_CWD = process.cwd()
const cmd = 'cli'

describe(cmd, () => {
  const prefix = 'init-test'
  const packagesName = 'packages'
  const pkgsJsonName = `${Agent.PKGS}.config.js`
  const packageJsonName = 'package.json'

  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    const _path = await io.mkdtemp(prefix)
    process.chdir(_path)
    await cliMain(['', '', 'init'])
    const statResult = await stat(packagesName)
    expect(statResult.isDirectory()).toBeTruthy()
    const pkgsJsonNameResult = await access(pkgsJsonName)
    expect(pkgsJsonNameResult).toBeUndefined()
    const packageJsonNameResult = await access(packageJsonName)
    expect(packageJsonNameResult).toBeUndefined()
    // const runTTargv = ['all', '--color']
    // const context = await cliMain(['', '', 'run', 'test', '--type', ...runTTargv], originVersion)
    // expect(context.ttArgv).toEqual(runTTargv)
  })
})
