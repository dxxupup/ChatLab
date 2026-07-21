import { getRegisteredAdapter } from '../registry'
import type { AIAdapter } from './types'

export function useAIService(): AIAdapter {
  return getRegisteredAdapter<AIAdapter>('ai')
}
