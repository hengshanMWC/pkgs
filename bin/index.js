#!/usr/bin/env node
const { updatePackageVersion, release, gitSave, publish } = require('../scripts')
const { program } = require('commander');
const pkg = require("../package.json");
program
  .version(pkg.version)
  .description('Simple and easy to use monorepos');
program
  .command('version')
  .option('--no-git', 'Remove recursively')
  .action((cmd) => {
    console.log(cmd)
    const arr = [updatePackageVersion]
    if (cmd.git) arr.push(gitSave)
    release(arr)
  })
program
  .command('publish')
  .option('--no-git', 'Remove recursively')
  .action((cmd) => {
    console.log(cmd)
    publish()
  })
program.parse(process.argv);
