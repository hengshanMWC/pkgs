const fs = require('fs-extra')
const { getPackagesDir } = require('@abmao/forb')
async function getPackagesJSON (dirs) {
  const result = []
  for (let i = 0; i < dirs.length; i++) {
    result.push(await fs.readJSON(dirs[i]))
  }
  return result
}
async function updatePackageVersion (
  packagesPath,
  rootPackage = 'package.json',
) {
  const dirs = await getPackagesDir(packagesPath)
  const packagesJSON = await getPackagesJSON(dirs)
  const { version } = await fs.readJSON(rootPackage)
  for (let i = 0; i < packagesJSON.length; i++) {
    const packageJSON = packagesJSON[i]
    packageJSON.version = version
    await fs.writeJSON(dirs[i], packageJSON, { spaces: 2 })
  }
}
module.exports = {
  getPackagesJSON,
  updatePackageVersion,
}
