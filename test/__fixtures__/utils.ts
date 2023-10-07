import { createPublishCommand } from '../../src'
import { DEFAULT_AGENT } from '../../src/constant'

export function createPackagePath(name: string) {
  return name ? `packages/${name}` : ''
}

export function getPublishCommand(cwd: string, version: string) {
  return createPublishCommand(version, {
    agent: DEFAULT_AGENT,
    options: {
      cwd,
    },
  })
}
