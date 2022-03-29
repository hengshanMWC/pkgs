import { execSync } from 'child_process'
import colors from 'colors'
console.log(`${colors.cyan.bold('release: start')} 🏗`)
execSync('npm run build', { stdio: 'inherit' })
// execSync('npm run test', { stdio: 'inherit' })
execSync('npm run pkgs:version', { stdio: 'inherit' })
execSync('npm run pkgs:publish', { stdio: 'inherit' })
console.log(`${colors.cyan.bold('release: success')} 🎉🎉🎉🎉🎊`)
