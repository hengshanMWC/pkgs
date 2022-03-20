#!/usr/bin/env node
const { program } = require('commander')
const { cmdPackagesPublish } = require('../scripts/publish')
const { cmdPackagesVersion } = require('../scripts/version')
const pkg = require('../package.json')
program
  .version(pkg.version)
  .description('Simple and easy to use monorepos')
program
  .command('version')
  .option('--no-git', 'Remove recursively')
  .action(cmd => {
    cmdPackagesVersion(cmd)
  })
program
  .command('publish')
  .option('--no-git', 'Remove recursively')
  .action(cmd => {
    cmdPackagesPublish(cmd)
  })
program.parse(process.argv)
