import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import type { Context } from '../index'
export function cmdPublish (context: Context) {
  handlePublish(context.rootPackage)
  context.forPack(function (packageJSON, index, context) {
    handlePublish(packageJSON, context.dirs[index])
  })
}
export async function handlePublish (
  packageJSON: IPackageJson<any>,
  cwd?: string,
) {
  if (!packageJSON.private) {
    let command = 'npm publish --access public'
    if (packageJSON.version?.includes('beta')) { command += ' --tag beta' }
    execSync(command, {
      stdio: 'inherit',
      cwd,
    })
  }
}
