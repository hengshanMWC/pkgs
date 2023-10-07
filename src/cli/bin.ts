#!/usr/bin/env node

import importLocal from 'import-local'
import npmlog from 'npmlog'
import { version } from '../../package.json'
import { cliMain } from '.'

if (importLocal(__filename))
  npmlog.info('cli', 'using local version of pkgs')

else
  cliMain(process.argv, version)
