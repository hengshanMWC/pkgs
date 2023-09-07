import { $ } from 'execa'
import colors from 'colors'
import { commandVersion, commandPublish } from '../src/index'
import { createTemplate } from './template'
console.log(`${colors.cyan.bold('release: start')} 🏗`);
(async function () {
  await $({ stdio: 'inherit' })`npm run test`
  await $({ stdio: 'inherit' })`npm run build`
  await createTemplate()
  await commandVersion()
  await commandPublish()
})()
console.log(`${colors.cyan.bold('release: success')} 🎉🎉🎉🎉🎊`)
