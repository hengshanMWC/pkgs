import fs from 'fs'
import path from 'path'

const filesDir = path.resolve('test', 'fixtures', 'files')

export default {
  script1: fs.readFileSync(path.join(filesDir, 'script1.js'), 'utf8'),
  script2: fs.readFileSync(path.join(filesDir, 'script2.js'), 'utf8'),
}
