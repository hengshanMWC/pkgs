const { execSync } = require('child_process')
const { readJSONSync } = require('fs-extra')
exports.release = async function release (cds) {

  const { version: oldVersion } = readJSONSync('package.json')

  execSync('npx bumpp', { stdio: 'inherit' })

  const { version } = readJSONSync('package.json')

  if (oldVersion === version) {
    console.log('canceled')
    process.exit()
  }
  if (Array.isArray(cds)) {
    await callCds(cds, version)
  }
}
async function callCds (cds, version) {
  for (let i = 0; i < cds.length; i++) {
    await cds[i](version)
  }
}