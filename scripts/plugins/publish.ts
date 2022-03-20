import { execSync } from 'child_process'
import { getPackagesDir } from '@abmao/forb'
import { getPackagesJSON } from '../utils'
export async function cmdPackagesPublish (packagesPath: string) {
  const { dirs, filesPath } = await getPackagesDir(packagesPath)
  const packagesJSON = await getPackagesJSON(filesPath)
  for (let i = 0; i < packagesJSON.length; i++) {
    const packageJSON = packagesJSON[i]
    let command = 'npm publish --access public'
    if (packageJSON.version?.includes('beta')) { command += ' --tag beta' }

    if (!packageJSON.private) {
      execSync(command, {
        stdio: 'inherit',
        cwd: dirs[i],
      })
    }
  }
}
