#!/usr/bin/env node
const { binVersion, binPublish } = require('../scripts')
const { program } = require('commander');
const pkg = require("../package.json");
program
  .version(pkg.version)
  .description('Simple and easy to use monorepos');
program
  .command('version')
  .option('--no-git', 'Remove recursively')
  .action((cmd) => {
    binVersion(cmd)
  })
program
  .command('publish')
  .option('--no-git', 'Remove recursively')
  .action((cmd) => {
    binPublish(cmd)
  })
program.parse(process.argv);
