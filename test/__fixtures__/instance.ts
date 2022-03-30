import type { SimpleGit, SimpleGitOptions } from 'simple-git'
import simpleGit from 'simple-git'

export function newSimpleGit (...args: [] | [string] | [Partial<SimpleGitOptions>]): SimpleGit {
  return simpleGit(...args as [Partial<SimpleGitOptions>])
}

export function newSimpleGitP (baseDir: unknown | string = '/tmp/example-repo') {
  if (typeof baseDir !== 'string') {
    throw new Error('Bad arguments to newSimpleGitP')
  }
  return require('../../promise')(baseDir)
}
