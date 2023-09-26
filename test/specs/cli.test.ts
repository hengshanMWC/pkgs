import { stat, access } from 'fs-extra'
import { cliMain } from '../../src/index'
import { io } from '../__fixtures__'
import { originVersion } from '../__fixtures__/constant'

const ORIGINAL_CWD = process.cwd()
const cmd = 'cli'

describe(cmd, () => {
  const prefix = 'init-test'
  const packagesName = 'packages'
  const pkgsJsonName = 'pkgs.config.js'
  const packageJsonName = 'package.json'

  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    // await cliMain(['', '', 'run', 'test:bin-i'], originVersion)
    // await cliMain(['', '', 'run', 'test:bin-i'], originVersion)
    const _path = await io.mkdtemp(prefix)
    process.chdir(_path)
    await cliMain(['', '', 'init'], originVersion)
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
