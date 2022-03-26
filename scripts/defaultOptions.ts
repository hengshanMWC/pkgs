export type Type = 'sync' | 'diff'
export interface ExecuteCommandOptions {
  packagesPath: string
  rootPackageIgnore: boolean
  mode: Type
  version: {
    message: string
    mode: Type
  }
  publish: {
    message: string
    mode: Type
    tag: string
  }
}
export const defaultOptions: ExecuteCommandOptions = {
  packagesPath: 'packages/*',
  rootPackageIgnore: true,
  mode: 'sync',
  version: {
    message: 'chore: version',
    mode: 'sync',
  },
  publish: {
    message: 'chore: publish',
    mode: 'sync',
    tag: '',
  },
}
