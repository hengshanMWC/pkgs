import type { Options } from 'execa'
import type { IPackageJson } from '@ts-type/package-dts'
import type { CommandResult, AgentType } from '../command'
import type { ExecuteCommandCli } from '../defaultOptions'

export interface Manager {
  agent: AgentType
  getConfig(): Promise<ExecuteCommandCli>
  run(cmd: string, args?: string[], options?: Options): CommandResult
  publish(
    packageJson: IPackageJson<any>,
    args?: string[], // 命令参数
    options?: Options, // 触发命令方法的参数
  ): CommandResult
}
