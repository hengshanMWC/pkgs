#!/usr/bin/env node
const { program } = require('commander')
const { executeCommand } = require('../dist/pkgs.cjs.min')
const pkg = require('../package.json')
program
  .version(pkg.version)
  .description('Simple and easy to use monorepos')
program
  .command('version')
  .option('--no-git', 'Remove recursively')
  .action(cmd => {
    console.log(cmd)
    executeCommand('version')
  })
program
  .command('publish')
  .option('--no-git', 'Remove recursively')
  .action(cmd => {
    console.log(cmd)
    executeCommand('publish')
  })
program.parse(process.argv)
