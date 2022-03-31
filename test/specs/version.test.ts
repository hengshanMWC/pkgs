import { executeCommand } from '../../index'
import { tagExpect, fillgit, createJson } from '../__fixtures__/commit'
import {
  getNewestCommitId,
} from '../../src/git'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  newSimpleGit,
} from '../__fixtures__'
import { files } from '../utils'
const ORIGINAL_CWD = process.cwd()
const cmd = 'version'
describe(cmd, () => {
  let context: SimpleGitTestContext
  let _path: string
  const prefix = 'packages-test'
  beforeEach(async () => {
    context = await fillgit()
    _path = await createJson(prefix, { version: '1.0.0' })
    process.chdir(_path)
  })
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    const git = newSimpleGit(context.root)
    await executeCommand(cmd, undefined, git, '1.0.1')
    const packageJson = await files.json('package.json')
    expect(packageJson.version).toBe('1.0.1')

    const tagCommitId = await tagExpect('v', git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
  })
  test('root diff', async () => {
    const git = newSimpleGit(context.root)
    await executeCommand(cmd, {
      mode: 'diff',
    }, git, '1.0.1')
    const packageJson = await files.json('package.json')
    expect(packageJson.version).toBe('1.0.1')

    const tagCommitId = await tagExpect('v', git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
  })

  test(`root diff, ${cmd} sync`, async () => {
    const git = newSimpleGit(context.root)
    await executeCommand(cmd, {
      mode: 'diff',
      [cmd]: {
        mode: 'sync',
      },
    }, git, '1.0.1')
    const packageJson = await files.json('package.json')
    expect(packageJson.version).toBe('1.0.1')

    const tagCommitId = await tagExpect('v', git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
  })

  test('message', async () => {
    const git = newSimpleGit(context.root)
    await executeCommand(cmd, {
      [cmd]: {
        message: 'chore: test',
      },
    }, git, '1.0.1')
    const packageJson = await files.json('package.json')
    expect(packageJson.version).toBe('1.0.1')

    const tagCommitId = await tagExpect('v', git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
  })
})
