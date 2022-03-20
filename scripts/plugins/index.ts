import type { IPackageJson } from '@ts-type/package-dts'
export type Plugin = (
  packagesJSON: IPackageJson[], version: IPackageJson['version']
) => Promise<void>
export async function usePlugin (
  plugins: Plugin[],
  packagesJSON: IPackageJson[],
  version: IPackageJson['version'],
) {
  for (let i = 0; i < plugins.length; i++) {
    await plugins[i](packagesJSON, version)
  }
}
