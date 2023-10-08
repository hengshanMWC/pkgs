#!/usr/bin/env node

import importLocal from 'import-local'
import npmlog from 'npmlog'
import { cliMain } from '../cli'

if (importLocal(__filename)) {
  npmlog.info('cli', 'using local version of pkgs')

} else {
  cliMain(process.argv)
}
