#!/usr/bin/env node

import importLocal from 'import-local'
import npmlog from 'npmlog'
import { cliMain } from '../cli'
import { Agent } from '../constant'

if (importLocal(__filename))
  npmlog.info('cli', `using local version of ${Agent.PKGS}`)

else
  cliMain(process.argv)
