export type Type = 'sync' | 'diff'
export interface ExecuteCommandOption {
  mode: Type
}
export interface ExecuteCommandVersionOption extends
  Partial<ExecuteCommandOption> {
  message?: string
}
export interface ExecuteCommandPublishOption extends
  Partial<ExecuteCommandOption> {
  tag?: string
}
export interface ExecuteCommandOptions extends ExecuteCommandOption {
  packagesPath: string
  rootPackage: Boolean
  version: ExecuteCommandVersionOption
  publish: ExecuteCommandPublishOption
}
export const defaultOptions: ExecuteCommandOptions = {
  packagesPath: 'packages/*',
  rootPackage: true,
  mode: 'sync',
  version: {
    mode: undefined,
    message: 'chore: version',
  },
  publish: {
    mode: undefined,
    tag: '',
  },
}
