import { execSync } from 'child_process'
import type { IPackageJson } from '@ts-type/package-dts'
import type { Context } from '../index'
export function cmdPublish (context: Context) {
  if (context.options.mode === 'sync') {
    return handleSyncPublish(context)
  }
  else if (context.options.mode === 'diff') {
    return handleDiffPublish(context)
  }
}
export async function handleSyncPublish (context: Context) {
  implementPublish(context.rootPackage)
  return context.forSyncPack(async function (packageJSON, index, context) {
    await implementPublish(packageJSON, context.dirs[index])
  })
}
export async function handleDiffPublish (context: Context) {
  const files = await context.getChangeFiles('p')
  console.log(files)
  // implementPublish(context.rootPackage)
  // context.forSyncPack(function (packageJSON, index, context) {
  //   implementPublish(packageJSON, context.dirs[index])
  // })
}
export async function implementPublish (
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
