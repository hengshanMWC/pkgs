import path from 'path'
import { copy } from 'fs-extra'
export function createTemplate () {
  copy(path.resolve(__dirname, '../src/cmd/init/template'), 'dist/template')
}
