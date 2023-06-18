import path from 'path'
import type { SimpleGit } from 'simple-git'
import { copy, readJSON } from 'fs-extra'
import { commandVersion, commandPublish } from '../../src/index'
import { tagExpect } from '../__fixtures__/commit'
import type {
  SimpleGitTestContext,
} from '../__fixtures__'
import {
  getNewestCommitId,
} from '../../src/utils/git'
import {
  newSimpleGit,
  setUpFilesAdded,
  createTestContext,
  setUpInit,
} from '../__fixtures__'
const ORIGINAL_CWD = process.cwd()
const cmd = 'publish'
describe(cmd, () => {
  let context: SimpleGitTestContext
  const prefix = 'publish-test'
  const packagesPublish = [
    'npm publish',
    'cd packages/a && npm publish --access public',
    'cd packages/b && npm publish --access public',
    'cd packages/c && npm publish --access public',
  ]
  async function handleCommand (cd: (git: SimpleGit) => void, dir = 'single') {
    context = await createTestContext(prefix, dir)

    process.chdir(context._root)
    await copy(path.resolve(__dirname, '../../examples', dir), dir)
    await setUpInit(context)

    const git = newSimpleGit(context.root)

    process.chdir(context.root)
    await git.add('.')
    await git.commit('feat: pkgs publish')
    await cd(git)

    const tagCommitId = await tagExpect('publish', git)
    const newCommitId = await getNewestCommitId(git)
    expect(newCommitId.includes(tagCommitId)).toBeTruthy()
  }
  function getPackages () {
    return Promise.all(['a', 'b', 'c'].map(item => {
      return readJSON(`packages/${item}/package.json`)
    }))
  }
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  test('default', async () => {
    await handleCommand(async function (git) {
      const cmds = await commandPublish(undefined, git)
      expect(cmds).not.toBeUndefined()
      cmds?.forEach(text => {
        expect(text).toBe(packagesPublish[0])
      })
    })
  })
  test('root diff & version beta', async () => {
    await handleCommand(async function (git) {
      const testCmds1 = function (cmds?: string[]) {
        cmds?.forEach(text => {
          expect(packagesPublish.includes(text)).toBeTruthy()
        })
      }
      // 先打上tag
      const syncVersion = '0.0.1'
      await commandVersion(undefined, git, '0.0.1')

      const cmds1 = await commandPublish({
        mode: 'diff',
      }, git)
      expect(cmds1).not.toBeUndefined()
      testCmds1(cmds1)
      // diff beta
      const newVersion = '0.0.1-beta.1'
      await setUpFilesAdded(context, ['packages/a/test'])
      await commandVersion({
        mode: 'diff',
      }, git, newVersion)

      // version beta
      const [a, b, c] = await getPackages()
      expect(a.version).toBe(newVersion)
      expect(b.version).toBe(syncVersion)
      expect(c.version).toBe(newVersion)

      const testCmds2 = (cmds?: string[]) => {
        cmds?.forEach(text => {
          const diffPublishs = [packagesPublish[1], packagesPublish[3]]
            .map(item => `${item} --tag beta`)
          expect(diffPublishs.includes(text)).toBeTruthy()
        })
      }
      const cmds2 = await commandPublish({
        mode: 'diff',
      }, git)
      expect(cmds2).not.toBeUndefined()
      testCmds2(cmds2)
    }, 'multiple')
  })

  test(`root diff, ${cmd} sync`, async () => {
    await handleCommand(async function (git) {
      const cmds = await commandPublish({
        mode: 'diff',
        [cmd]: {
          mode: 'sync',
        },
      }, git)
      expect(cmds).not.toBeUndefined()
      cmds?.forEach(text => {
        expect(packagesPublish.slice(1).includes(text)).toBeTruthy()
      })
    }, 'multiple')
  })

  test('message', async () => {
    const tag = 'test'
    await handleCommand(async function (git) {
      const cmds = await commandPublish({
        [cmd]: {
          tag,
        },
      }, git)
      expect(cmds).not.toBeUndefined()
      cmds?.forEach(text => {
        expect(packagesPublish
          .slice(1)
          .map(item => `${item} --tag ${tag}`)
          .includes(text),
        ).toBeTruthy()
      })
    }, 'multiple')
  })
})
