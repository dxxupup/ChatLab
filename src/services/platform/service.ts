/**
 * usePlatformService — 平台能力服务 composable
 */

import { getRegisteredAdapter } from '../registry'
import type { PlatformAdapter } from './types'

export function usePlatformService(): PlatformAdapter {
  return getRegisteredAdapter<PlatformAdapter>('platform')
}
