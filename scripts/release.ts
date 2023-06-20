import { execSync } from 'child_process'
import colors from 'colors'
import { commandVersion, commandPublish } from '../src/index'
import { createTemplate } from './template'
console.log(`${colors.cyan.bold('release: start')} 🏗`);
(async function () {
  execSync('npm run test', { stdio: 'inherit' })
  execSync('npm run build', { stdio: 'inherit' })
  await createTemplate()
  await commandVersion()
  await commandPublish()
})()
console.log(`${colors.cyan.bold('release: success')} 🎉🎉🎉🎉🎊`)
