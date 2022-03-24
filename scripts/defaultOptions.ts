export interface ExecuteCommandOptions {
  packagesPath: string
  mode: 'sync' | 'diff'
  version: {
    commitMessage: string
  }
  publish: {
    commitMessage: string
  }
}
export const defaultOptions: ExecuteCommandOptions = {
  packagesPath: 'packages/*',
  mode: 'sync',
  version: {
    commitMessage: 'chore: upgrade version',
  },
  publish: {
    commitMessage: 'chore: release publish',
  },
}
