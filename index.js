const { updatePackageVersion } = require('./utils')
async function run () {
  await updatePackageVersion()
}
run()
