export interface ExecuteCommandOptions {
  packagesPath?: string
  mode?: 'sync' | 'diff'
}
export const defaultOptions: ExecuteCommandOptions = {
  packagesPath: 'packages/*',
  mode: 'sync',
}
