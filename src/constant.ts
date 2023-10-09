export const RELY_KEYS = [
  'bundleDependencies',
  'bundledDependencies',
  'optionalDependencies',
  'peerDependencies',
  'devDependencies',
  'dependencies',
]

// export const PACKAGES_PATH = ['packages/*', '.']
export const PACKAGES_PATH = ['packages/*']

/** console */
export const WARN_NOW_CHANGE = 'canceled: No new commit'
export const WARN_NOW_VERSION = 'canceled: The version has not changed'
export const WARN_NOW_RUN = 'There are no packages that need to run commands'

export enum Agent {
  PKGS = 'pkgs',
  GIT = 'git',
  PNPM = 'pnpm',
  YARN = 'yarn',
  NPM = 'npm',
}

export const DEFAULT_AGENT = Agent.PNPM

export enum Mode {
  SYNC = 'sync',
  DIFF = 'diff',
}

export const ModeOptions = ['--mode <type>', Object.values(Mode).join(' | ')] as const

export const PushOptions = ['--push', 'git push'] as const
export const NoPushOptions = ['--no-push', 'not git push'] as const

export const DAG = ['--DAG', 'Is DAG enabled'] as const
export const NoDAG = ['--no-DAG', 'Do you want to turn off DAG'] as const

export const Serial = ['--serial', 'Whether to turn on command serialization'] as const
export const NoDSerial = ['--no-serial', 'Whether to turn off command serialization'] as const
