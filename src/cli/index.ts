import { program } from 'commander'
import { PluginGroup } from 'plugin-group'
import { isUndefined } from 'lodash'
import { cliVersion, cliSuccess } from '../utils/tips'
import { Context } from '../lib/context'
import type { PluginData } from '../command'
import { getTTArgv } from '../utils'
export async function cliMain (argv: NodeJS.Process['argv'], version = '0.0.0'): Promise<Context> {
  let _resolve: (context: Context) => void
  let _reject: (error: Error) => void
  const p: Promise<Context> = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })

  const pluginGroup = new PluginGroup<PluginData>()
  const config = await Context.assignConfig()
  pluginGroup.use(...config.plugins)

  program
    .version(version, '-v, --version')
    .description('Simple monorepo combined with pnpm')

  pluginGroup.map.forEach(value => {
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
          cliSuccess()
        }
        catch (error) {
          _reject(error as Error)
        }
      })
    if (!isUndefined(value.allowUnknownOption)) {
      _program.allowUnknownOption(value.allowUnknownOption)
    }
    if (value.options) {
      value.options.forEach(option => {
        _program = _program.option(...option)
      })
    }
  })
  program.parse(argv)
  return p
}
