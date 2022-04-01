import path from 'path'
import fs from 'fs-extra'
export function createTemplate () {
  fs.copy(path.resolve(__dirname, '../src/cmd/init/template'), 'dist/template')
}
