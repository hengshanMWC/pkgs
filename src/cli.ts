import path from 'node:path'
import { program } from 'commander'
import { PluginGroup } from 'plugin-group'
import { isUndefined } from 'lodash'
import { cliSuccess, cliVersion } from './utils/tips'
import { Context } from './lib/context'
import type { PluginData } from './plugin'
import { getJSON, getTTArgv } from './utils'
import { Agent } from './constant'

export async function cliMain(argv: NodeJS.Process['argv'], version?: string): Promise<Context> {
  console.time(Agent.PKGS)
  if (!version) {
    const { version: _version } = await getJSON(path.resolve(__dirname, '../package.json'))
    version = _version || '0.0.0'
  }
  let _resolve: (context: Context) => void
  let _reject: (error: Error) => void
  const p: Promise<Context> = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  const pluginGroup = new PluginGroup<PluginData>()
  const config = await Context.assignConfig()
  await pluginGroup.use(...config.plugins)

  program
    .version(version, '-v, --version')
    .description('Simple monorepo combined with pnpm')

  pluginGroup.map.forEach((value) => {
    let _program = program
      .command(value.command)
      .description(value.description)
      .action(async (...args) => {
        try {
          cliVersion(value.id)
          const context = await Context.create({
            args,
            argv,
            ttArgv: getTTArgv(...args),
          })

          await value.action(context, ...args)
          _resolve(context)

          console.log('\n')
          console.timeEnd(Agent.PKGS)
          cliSuccess()
        }
        catch (error) {
          _reject(error as Error)
        }
      })
    if (!isUndefined(value.allowUnknownOption))
      _program.allowUnknownOption(value.allowUnknownOption)

    if (value.options) {
      value.options.forEach((option) => {
        _program = _program.option(...option)
      })
    }
  })
  program.parse(argv)
  return p
}
