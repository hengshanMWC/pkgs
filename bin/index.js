#!/usr/bin/env node
const { updatePackageVersion, release } = require('../scripts')
const { program } = require('commander');
const pkg = require("../package.json");
program
  .version(pkg.version)
  .description('Simple and easy to use monorepos');
program
  .command('version')
  .option('-r, --recursive', 'Remove recursively')
  .action((dir, cmd) => {
    release([
      updatePackageVersion
    ])
  })
program.parse(process.argv);
