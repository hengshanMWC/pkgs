import colors from 'colors'
import packageJson from '../../package.json'

export function cliVersion(cmd: string) {
  const version = colors.magenta(`v${packageJson.version}`)
  console.log(`pkgs cli: ${version} run '${colors.green(cmd)}'`)
}
export function cliSuccess() {
  const text = colors.white.bold('success')
  console.log(`pkgs cli: ${text}`)
}
cliSuccess()
