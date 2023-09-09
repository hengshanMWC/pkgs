import { Agent, DEFAULT_AGENT } from '../constant'
import type { BaseManager } from './agent'
import { PnpmManager } from './agent'

const productList: Map<any, typeof BaseManager> = new Map()
productList.set(Agent.PNPM, PnpmManager)

// 工厂模式
export function createManagerProduct (key: any) {
  const Product = (productList.get(key) ?? productList.get(DEFAULT_AGENT)) as typeof BaseManager
  return new Product()
}

// // 单例模式
// let instance: BaseManager

// export function getManagerInstance (key: any) {
//   if (!instance) {
//     instance = createManagerProduct(key)
//   }
//   return instance
// }
