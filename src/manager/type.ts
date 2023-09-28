import type { Options } from 'execa'
import type { IPackageJson } from '@ts-type/package-dts'
import type { CommandResult, AgentType } from '../plugin'
import type { ExecuteCommandCli } from '../defaultOptions'

export interface ManagerApi {
  // npm、pnpm之类
  agent: AgentType
  // 获取包工作区配置
  getConfig(): Promise<ExecuteCommandCli>
  // 例如：npm run [cmd]
  run(cmd: string, args?: string[], options?: Options): CommandResult
  // 例如：npm publish
  publish(
    packageJson: IPackageJson<any>,
    args?: string[], // 命令参数
    options?: Options, // 触发命令方法的参数
  ): CommandResult
}
