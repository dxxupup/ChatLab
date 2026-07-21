/**
 * useImportService — 导入 Service composable
 */

import { getRegisteredAdapter } from '../registry'
import type { ImportAdapter } from './types'

export function useImportService(): ImportAdapter {
  return getRegisteredAdapter<ImportAdapter>('import')
}
