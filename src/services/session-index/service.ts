/**
 * useSessionIndexService — 会话索引服务 composable
 */

import { getRegisteredAdapter } from '../registry'
import type { SessionIndexAdapter } from './types'

export function useSessionIndexService(): SessionIndexAdapter {
  return getRegisteredAdapter<SessionIndexAdapter>('session-index')
}
