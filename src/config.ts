import {loadCode} from 'load-code'
import {globby} from 'globby';
import { getExportDefault } from './utils';
import { ExecuteCommandConfig } from './defaultOptions';
export async function loadConfig<T> (fileName: string) {
  const files = await globby([`${fileName}.*`]);
  if (!files.length) return
  const file = files[0]
  const code = await loadCode(file) as T
  return getExportDefault(code)
}

export async function defineConfig (config: Partial<ExecuteCommandConfig>) {
  return config
}
