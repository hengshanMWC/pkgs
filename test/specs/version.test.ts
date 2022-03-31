import path from 'path'
import fs from 'fs-extra'
import { executeCommand } from '../../index'
import { tagExpect, fillgit } from '../__fixtures__/commit'
import {
  getNewestCommitId,
} from '../../src/git'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  newSimpleGit,
  io,
} from '../__fixtures__'

const ORIGINAL_CWD = process.cwd()
const cmd = 'version'
describe(cmd, () => {
  let context: SimpleGitTestContext
  let _path: string
  const newVersion = '1.0.1'

  async function handleCommand (cd) {
    const dir = 'single'
    const mkdtemPath = await io.mkdtemp('version-test')
    process.chdir(mkdtemPath)
    _path = path.join(mkdtemPath, dir)
    await fs.copy(path.resolve(__dirname, '../temp', dir), dir)

    const git = await cd()

    const packageJson = await fs.readJSON('package.json')
    expect(packageJson.version).toBe(newVersion)

    const tagCommitId = await tagExpect('v', git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
  }
  beforeEach(async () => {
    context = await fillgit()
  })
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    await handleCommand(async function () {
      const git = newSimpleGit(context.root)
      process.chdir(_path)
      await executeCommand(cmd, undefined, git, newVersion)
      return git
    })
  })
  test('root diff', async () => {
    await handleCommand(async function () {
      const git = newSimpleGit(context.root)
      process.chdir(_path)
      await executeCommand(cmd, {
        mode: 'diff',
      }, git, '1.0.1')
      return git
    })
  })

  test(`root diff, ${cmd} sync`, async () => {
    await handleCommand(async function () {
      const git = newSimpleGit(context.root)
      process.chdir(_path)
      await executeCommand(cmd, {
        mode: 'diff',
        [cmd]: {
          mode: 'sync',
        },
      }, git, '1.0.1')
      return git
    })
  })

  test('message', async () => {
    await handleCommand(async function () {
      const git = newSimpleGit(context.root)
      process.chdir(_path)
      await executeCommand(cmd, {
        [cmd]: {
          message: 'chore: test',
        },
      }, git, '1.0.1')
      return git
    })
  })
})
