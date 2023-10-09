import colors from 'colors'
import packageJson from '../../package.json'
import { Agent } from '../constant'

export function cliVersion(cmd: string) {
  const version = colors.magenta(`v${packageJson.version}`)
  console.log(`${Agent.PKGS} cli: ${version} run '${colors.green(cmd)}'`)
}
export function cliSuccess() {
  const text = colors.white.bold('success')
  console.log(`${Agent.PKGS} cli: ${text}`)
}
