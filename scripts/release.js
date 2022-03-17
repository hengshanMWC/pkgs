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
    await callCds(cds)
  }
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' })
  execSync(`git tag -a v${version} -m "v${version}"`, { stdio: 'inherit' })
}
async function callCds (cds) {
  for (let i = 0; i < cds.length; i++) {
    await cds[i]()
  }
}