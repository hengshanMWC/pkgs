import {loadCode} from 'load-code'
import {globby} from 'globby';
import { getExportDefault } from './utils';
export async function loadConfig<T> (fileName: string) {
  const files = await globby([`${fileName}.*`]);
  if (!files.length) return
  const file = files[0]
  const code = await loadCode(file) as T
  return getExportDefault(code)
}
