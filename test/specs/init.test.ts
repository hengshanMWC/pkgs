import fs from 'fs-extra'
import { executeCommandInit } from '../../index'
import { io } from '../__fixtures__'

const ORIGINAL_CWD = process.cwd()
const cmd = 'init'

describe(cmd, () => {
  const prefix = 'init-test'
  const packagesName = 'packages'
  const pkgsJsonName = 'pkgs.json'
  const packageJsonName = 'package.json'

  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    const _path = await io.mkdtemp(prefix)
    process.chdir(_path)
    await executeCommandInit()
    console.log(_path)
    const stat = await fs.stat(packagesName)
    expect(stat.isDirectory()).toBeTruthy()
    const pkgsJsonNameResult = await fs.access(pkgsJsonName)
    expect(pkgsJsonNameResult).toBeUndefined()
    const packageJsonNameResult = await fs.access(packageJsonName)
    expect(packageJsonNameResult).toBeUndefined()
    // 不会覆盖
    await executeCommandInit()
  })
})
