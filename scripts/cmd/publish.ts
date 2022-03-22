import { execSync } from 'child_process'
import type { Context } from '../index'
export async function cmdPublish (context: Context) {
  await context.forPack(async function (packageJSON, index, context) {
    let command = 'npm publish --access public'
    if (packageJSON.version?.includes('beta')) { command += ' --tag beta' }

    if (!packageJSON.private) {
      execSync(command, {
        stdio: 'inherit',
        cwd: context.dirs[index],
      })
    }
  })
}
