import { execSync } from 'child_process'
import colors from 'colors'
import { commandVersion, commandPublish } from '../src/index'
console.log(`${colors.cyan.bold('release: start')} 🏗`);
(async function () {
  execSync('npm run test', { stdio: 'inherit' })
  execSync('npm run build:npm', { stdio: 'inherit' })
  await commandVersion()
  await commandPublish()
})()
console.log(`${colors.cyan.bold('release: success')} 🎉🎉🎉🎉🎊`)
