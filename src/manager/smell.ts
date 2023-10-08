import { detect, getDefaultAgent } from '@antfu/ni'
import { createManagerProduct } from './factory'

export async function agentSmell() {
  const agent = (await detect()) || (await getDefaultAgent())
  return createManagerProduct(agent)
}
