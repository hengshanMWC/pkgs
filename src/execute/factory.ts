import { BaseExecute } from './lib/base'

export function createExecuteProduct (...data: ConstructorParameters<typeof BaseExecute>) {
  return new BaseExecute(...data)
}
