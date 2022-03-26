export type Type = 'sync' | 'diff'
export interface ExecuteCommandOption {
  mode: Type
}
export interface ExecuteCommandVersionOption extends
  Partial<ExecuteCommandOption> {
  message: string
}
export interface ExecuteCommandPublishOption extends
  ExecuteCommandVersionOption {
  tag: string
}
export interface ExecuteCommandOptions extends ExecuteCommandOption {
  packagesPath: string
  version: ExecuteCommandVersionOption
  publish: ExecuteCommandPublishOption
}
export const defaultOptions: ExecuteCommandOptions = {
  packagesPath: 'packages/*',
  mode: 'sync',
  version: {
    mode: undefined,
    message: 'chore: version',
  },
  publish: {
    mode: undefined,
    message: 'chore: publish',
    tag: '',
  },
}
