const { execSync } = require('child_process')
exports.gitSave = function gitSave (version) {
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' })
  execSync(`git tag -a v${version} -m "v${version}"`, { stdio: 'inherit' })
}