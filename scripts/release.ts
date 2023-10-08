import { $ } from 'execa'
import colors from 'colors'
import { commandPublish, commandVersion } from '../src/index'
import { build } from './utils/build'

console.log(`${colors.cyan.bold('release: start')} 🏗`);
(async function () {
  await $({ stdio: 'inherit' })`npm run test`
  await build()
  await commandVersion()
  await commandPublish()
})()
console.log(`${colors.cyan.bold('release: success')} 🎉🎉🎉🎉🎊`)
