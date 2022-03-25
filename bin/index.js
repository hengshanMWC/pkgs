#!/usr/bin/env node
const { program } = require('commander')
const { executeCommand } = require('../dist/pkgs.cjs.min')
const pkg = require('../package.json')
function handleExecuteCommand (type, cmd) {
  const mode = cmd.mode !== true ? cmd.mode : 'sync'
  executeCommand(type, {
    mode,
  })
}
program
  .version(pkg.version)
  .description('Simple and easy to use monorepos')
program
  .command('version')
  .option('-m, --mode [type]', 'sync || diff', 'sync')
  .description('mode: sync | diff')
  .action(cmd => {
    handleExecuteCommand('version', cmd)
  })
program
  .command('publish')
  .option('-m, --mode [type]', 'sync || diff', 'sync')
  .description('mode: sync | diff')
  .action(cmd => {
    handleExecuteCommand('publish', cmd)
  })
program.parse(process.argv)
