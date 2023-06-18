import { relative, parse } from 'path'
import JoyCon from 'joycon'
import { bundleRequire } from 'bundle-require'
import { readFile } from 'fs-extra'
import { jsoncParse } from './utils'
import type { ExecuteCommandConfig } from './defaultOptions'
const joycon = new JoyCon()

const loadJson = async (filepath: string) => {
  try {
    return jsoncParse(await readFile(filepath, 'utf8'))
  }
  catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to parse ${relative(process.cwd(), filepath)}: ${
          error.message
        }`,
      )
    }
    else {
      throw error
    }
  }
}

const jsonLoader = {
  test: /\.json$/,
  load (filepath: string) {
    return loadJson(filepath)
  },
}

joycon.addLoader(jsonLoader)
export async function loadConfig (
  cli: string,
  cwd = process.cwd(),
): Promise<{ path?: string; data?: ReturnType<typeof defineConfig> }> {
  const configJoycon = new JoyCon()
  const configPath = await configJoycon.resolve(
    [
      `${cli}.config.ts`,
      `${cli}.config.js`,
      `${cli}.config.cjs`,
      `${cli}.config.mjs`,
      `${cli}.config.json`,
    ],
    cwd,
    parse(cwd).root,
  )

  if (configPath) {
    if (configPath.endsWith('.json')) {
      let data = await loadJson(configPath)
      if (configPath.endsWith('package.json')) {
        data = data[cli]
      }
      if (data) {
        return { path: configPath, data }
      }
      return {}
    }

    const config = await bundleRequire({
      filepath: configPath,
    })
    return {
      path: configPath,
      data: config.mod[cli] || config.mod.default || config.mod,
    }
  }

  return {}
}

export function defineConfig (config: Partial<ExecuteCommandConfig>) {
  return config
}
