import { program } from 'commander'
import { PluginGroup } from 'plugin-group'
import { cliVersion, cliSuccess } from '../utils/tips'
import { Context } from '../lib/context'
import type { PluginData } from '../command'
export async function cliMain (argv: NodeJS.Process['argv'], version: string) {
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
        cliVersion(value.id)
        const context = await Context.create()
        await value.action(context, ...args)
        cliSuccess()
      })
    if (value.option) {
      value.option.forEach(item => {
        _program = _program.option(...item)
      })
    }
  })
  program.parse(argv)
}
