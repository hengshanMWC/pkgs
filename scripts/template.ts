import path from 'path'
import { copy } from 'fs-extra'
export function createTemplate () {
  copy(path.resolve(__dirname, '../src/command/init/template'), 'dist/template')
}
