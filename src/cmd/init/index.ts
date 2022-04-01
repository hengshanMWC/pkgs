import path from 'path'
import fs from 'fs-extra'
export async function cmdInit () {
  await fs.copy(path.resolve(__dirname, './template'), './')
}
