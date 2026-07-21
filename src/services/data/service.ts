/**
 * useDataService — 数据查询 Service composable
 *
 * 薄包装层，从 registry 获取已注册的 DataAdapter 实例。
 * 在 initServices() 完成后即可在任意位置调用。
 */

import { getRegisteredAdapter } from '../registry'
import type { DataAdapter } from './types'

export function useDataService(): DataAdapter {
  return getRegisteredAdapter<DataAdapter>('data')
}
