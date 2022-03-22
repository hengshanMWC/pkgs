#!/usr/bin/env node
const { program } = require('commander')
const { executeCommand } = require('../dist/pkgs.cjs.min')
const pkg = require('../package.json')
program
  .version(pkg.version)
  .description('Simple and easy to use monorepos')
program
  .command('version')
  .action(() => {
    executeCommand('version')
  })
program
  .command('publish')
  .action(() => {
    executeCommand('publish')
  })
program.parse(process.argv)
