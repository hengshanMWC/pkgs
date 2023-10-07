import path, { join } from 'node:path'
import type { WriteFileOptions } from 'node:fs'
import { existsSync, mkdir, mkdtemp, realpathSync, writeFile } from 'node:fs'
import type { SimpleGit } from 'simple-git'
import { copy } from 'fs-extra'
import { newSimpleGit } from './instance'
import { setUpInit } from './setup-init'

export interface SimpleGitTestContext {
  /** Creates a directory under the repo root at the given path(s) */
  dir (...segments: string[]): Promise<string>

  /** Creates a file at the given path under the repo root with the supplied content */
  file (path: string | [string, string], content?: string): Promise<string>

  /** Creates many files at the given paths, each with file content based on their name */
  files (...paths: Array<string | [string, string]>): Promise<void>

  /** Generates the path to a location within the root directory */
  path (...segments: string[]): string

  /** Root directory for the test context */
  readonly root: string
  readonly _root: string

  /** Fully qualified resolved path, accounts for any symlinks to the temp directory */
  readonly rootResolvedPath: string

  readonly git: SimpleGit
}

export const io = {
  mkdir(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (existsSync(path))
        return resolve(path)

      mkdir(path, { recursive: true }, err => err ? reject(err) : resolve(path))
    })
  },
  mkdtemp(prefix): Promise<string> {
    return new Promise((resolve, reject) => {
      mkdtemp(`${process.env.TMPDIR || '/.tmp/pkgs-'}${prefix}-`, (err, path) => {
        err ? reject(err) : resolve(path)
      })
    })
  },
  writeFile(path: string, content: string, encoding: WriteFileOptions = 'utf-8'): Promise<string> {
    return new Promise((resolve, reject) => {
      writeFile(path, content, encoding, (err) => {
        err ? reject(err) : resolve(path)
      })
    })
  },
}

export async function createTestContext(prefix: string, dir?: string): Promise<SimpleGitTestContext> {
  const _root = await io.mkdtemp(prefix)
  const root = dir ? join(_root, dir) : _root

  const context: SimpleGitTestContext = {
    path(...segments) {
      return join(root, ...segments)
    },
    async dir(...paths) {
      if (!paths.length)
        return root

      return io.mkdir(context.path(...paths))
    },
    async file(path, content = `File content ${path}`) {
      if (Array.isArray(path))
        await context.dir(path[0])

      const pathArray = Array.isArray(path) ? path : [path]
      return io.writeFile(context.path(...pathArray), content)
    },
    async files(...paths) {
      for (const path of paths)
        await context.file(path)
    },
    get root() {
      return root
    },
    get _root() {
      return _root
    },
    get rootResolvedPath() {
      return realpathSync(context.root)
    },
    get git() {
      return newSimpleGit(root)
    },
  }

  return context
}

export async function handleCommand(dir: string, prefix: string) {
  const context: SimpleGitTestContext = await createTestContext(prefix, dir)

  process.chdir(context._root)
  await copy(path.resolve(__dirname, '../template', dir), dir)

  process.chdir(path.resolve(context._root, dir))
  await setUpInit(context)
  return context
}
