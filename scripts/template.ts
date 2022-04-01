import path from 'path'
import fs from 'fs-extra'
fs.copy(path.resolve(__dirname, '../src/cmd/init/template'), 'dist/template')
