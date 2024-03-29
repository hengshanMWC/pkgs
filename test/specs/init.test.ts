import path from 'node:path'
import { access, appendFile, readFile, stat, writeFile } from 'fs-extra'
import { Agent, commandInit } from '../../src/index'
import { io } from '../__fixtures__'

const ORIGINAL_CWD = process.cwd()
const cmd = 'init'

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
    await commandInit()
    const statResult = await stat(packagesName)
    expect(statResult.isDirectory()).toBeTruthy()
    const pkgsJsonNameResult = await access(pkgsJsonName)
    expect(pkgsJsonNameResult).toBeUndefined()
    const packageJsonNameResult = await access(packageJsonName)
    expect(packageJsonNameResult).toBeUndefined()
    const packagesFile = path.resolve(packagesName, '_path')
    await writeFile(packagesFile, _path, 'utf-8')
    await appendFile(pkgsJsonName, _path, 'utf-8')
    await appendFile(packageJsonName, _path, 'utf-8')
    // 不会覆盖
    await commandInit()
    const packagesFileData = await readFile(packagesFile, 'utf-8')
    const pkgsJsonData = await readFile(pkgsJsonName, 'utf-8')
    const packageJsonData = await readFile(packageJsonName, 'utf-8')
    expect(packagesFileData.trim()).toBe(_path)
    expect(pkgsJsonData.includes(_path)).toBeTruthy()
    expect(packageJsonData.includes(_path)).toBeTruthy()
  })
})
