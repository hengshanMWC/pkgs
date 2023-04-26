import { execSync } from 'child_process'
import colors from 'colors'
import { executeCommand } from '../src/index'
console.log(`${colors.cyan.bold('release: start')} 🏗`);
(async function () {
  execSync('npm run test', { stdio: 'inherit' })
  execSync('npm run build:npm', { stdio: 'inherit' })
  await executeCommand('version')
  await executeCommand('publish')
})()
console.log(`${colors.cyan.bold('release: success')} 🎉🎉🎉🎉🎊`)
