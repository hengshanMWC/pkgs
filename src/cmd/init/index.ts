import path from 'path'
import fs from 'fs-extra'
export function cmdInit () {
  const packagesName = 'packages'
  const pkgsJsonName = 'pkgs.json'
  const packageJsonName = 'package.json'
  const dirPath = path.resolve(__dirname, './template')
  const pkgsJson = path.resolve(dirPath, pkgsJsonName)
  const packageJson = path.resolve(dirPath, packageJsonName)
  return Promise.all([
    createMkdir(packagesName),
    createFile(pkgsJsonName, pkgsJson),
    createFile(packageJsonName, packageJson),
  ])
}
async function createMkdir (dirName: string) {
  try {
    const stat = await fs.stat(dirName)
    if (!stat.isDirectory()) {
      throw new Error()
    }
  }
  catch {
    await fs.mkdir(dirName)
  }
}
async function createFile (fileName: string, filePath: string) {
  try {
    await fs.access(fileName)
  }
  catch {
    await fs.copyFile(filePath, fileName)
  }
}
