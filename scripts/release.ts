import { execSync } from 'child_process'
execSync('npm run build', { stdio: 'inherit' })
execSync('npm run test', { stdio: 'inherit' })
execSync('npm run pkgs:version', { stdio: 'inherit' })
execSync('npm run pkgs:publish', { stdio: 'inherit' })
