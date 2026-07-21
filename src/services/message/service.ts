/**
 * useMessageService — 消息查询服务 composable
 */

import { getRegisteredAdapter } from '../registry'
import type { MessageAdapter } from './types'

export function useMessageService(): MessageAdapter {
  return getRegisteredAdapter<MessageAdapter>('message')
}
