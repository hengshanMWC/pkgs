import path from 'node:path'
import { copy } from 'fs-extra'

export function createTemplate() {
  return copy(path.resolve(__dirname, '../../src/plugin/init/template'), 'dist/template')
}
