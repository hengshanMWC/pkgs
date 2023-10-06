import { $ } from 'execa'
import { createTemplate } from './template'
export async function build () {
  await $({ stdio: 'inherit' })`npm run build:unbuild`
  await $({ stdio: 'inherit' })`npm run tsc`
  await createTemplate()
}
