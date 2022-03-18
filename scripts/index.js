const fs = require('fs-extra')
const { execSync } = require('child_process')
const { getPackagesDir } = require('@abmao/forb')
const { release } = require('./release')
const { gitSave } = require('./gitSave')

async function getPackagesJSON (dirs) {
  const result = []
  for (let i = 0; i < dirs.length; i++) {
    result.push(await fs.readJSON(dirs[i]))
  }
  return result
}
async function updatePackageVersion (version, packagesPath) {
  const { filesPath } = await getPackagesDir(packagesPath)
  const packagesJSON = await getPackagesJSON(filesPath)
  for (let i = 0; i < packagesJSON.length; i++) {
    const packageJSON = packagesJSON[i]
    packageJSON.version = version
    await fs.writeJSON(filesPath[i], packageJSON, { spaces: 2 })
  }
}
async function binPublish (packagesPath) {
  const { dirs, filesPath } = await getPackagesDir(packagesPath)
  const packagesJSON = await getPackagesJSON(filesPath)
  for (let i = 0; i < packagesJSON.length; i++) {
    const packageJSON = packagesJSON[i]
    if (!packageJSON.private) {
      console.log(dirs[i])
      execSync(`cd ${dirs[i]} && npm publish`, { stdio: 'inherit' })
    }
  }
}
function binVersion (cmd) {
  const arr = [updatePackageVersion]
  if (cmd.git) arr.push(gitSave)
  release(arr)
}
module.exports = {
  getPackagesJSON,
  updatePackageVersion,
  release,
  gitSave,
  binPublish,
  binVersion
}
