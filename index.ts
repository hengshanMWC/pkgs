import { cliMain } from './src'
import { originVersion } from './test/__fixtures__/constant'
async function main () {
  await cliMain(['', '', 'run', 'test:bin-i'], originVersion)
  await cliMain(['', '', 'run', 'test:bin-i'], originVersion)
}
main()
