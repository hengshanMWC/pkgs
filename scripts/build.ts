import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { createTemplate } from './template'
fs.remove(path.resolve(__dirname, '../dist'))
  .finally(() => {
    execSync('node rollup.config.js', { stdio: 'inherit' })
    createTemplate()
  })
