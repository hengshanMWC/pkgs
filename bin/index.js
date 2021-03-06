#!/usr/bin/env node
const { program } = require('commander')
const {
  executeCommand,
  executeCommandTag,
  executeCommandInit,
  executeCommandRun,
} = require('../dist/pkgs.cjs.min')
const pkg = require('../package.json')
function handleExecuteCommand (type, cmd) {
  executeCommand(type, {
    [type]: cmd,
  })
}
program
  .version(pkg.version)
  .description('Simple monorepo combined with pnpm')
program
  .command('version')
  .description('version package')
  .option('--mode <type>', 'sync | diff')
  .option('-m, --message <message>', 'commit message')
  .action(cmd => {
    handleExecuteCommand('version', cmd)
  })
program
  .command('publish')
  .description('publish package')
  .option('--mode <type>', 'sync | diff')
  .option('--tag <type>', 'npm publish --tag <type>')
  .option('-m, --message <message>', 'commit message')
  .action(cmd => {
    handleExecuteCommand('publish', cmd)
  })

program
  .command('tag')
  .description('pkgs tag, diff mode: Compare according to tag')
  .option('-p', 'publish tag')
  .option('-v', 'version tag')
  .action(cmd => {
    executeCommandTag(cmd)
  })

program
  .command('init')
  .description('create pkgs file')
  .action(() => {
    executeCommandInit()
  })
program
  .command('run <cmd> [mode]')
  .description('run diff scripts.\n mode: work | stage | repository, default: work')
  .option('-r <boolean>', 'Include rootPackage', 'true')
  .action((cmd, mode, option) => {
    executeCommandRun(cmd, mode, option.r !== 'false')
  })
program.parse(process.argv)
