import { program } from 'commander'
import pkg from '../package.json'
import { cliVersion, cliSuccess } from './utils/tips'
import { PluginStore } from './lib/plugin'
import { Context } from './lib/context'
export async function cliMain (argv: NodeJS.Process['argv']) {
  const pluginStore = new PluginStore()
  const config = await Context.assignConfig()
  pluginStore.use(...config.plugin)
  program
    .version(pkg.version)
    .description('Simple monorepo combined with pnpm')
  pluginStore.map.forEach(value => {
    let _program = program
      .command(value.id)
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
