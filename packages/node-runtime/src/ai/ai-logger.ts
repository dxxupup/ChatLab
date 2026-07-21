/**
 * AI 日志模块（平台无关）
 *
 * 将 AI 相关操作日志写入本地文件。Electron 和 Server/CLI 共用。
 */

import * as fs from 'fs'
import * as path from 'path'

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export class AiLogger {
  private debugMode = false
  private logDir: string
  private logFile: string | null = null
  private logStream: fs.WriteStream | null = null

  constructor(logsDir: string) {
    this.logDir = path.join(logsDir, 'ai')
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }

  isDebugMode(): boolean {
    return this.debugMode
  }

  debug(category: string, message: string, data?: unknown): void {
    this.writeLog('DEBUG', category, message, data)
  }

  info(category: string, message: string, data?: unknown): void {
    this.writeLog('INFO', category, message, data)
  }

  warn(category: string, message: string, data?: unknown): void {
    this.writeLog('WARN', category, message, data)
  }

  error(category: string, message: string, data?: unknown): void {
    this.writeLog('ERROR', category, message, data)
  }

  close(): void {
    if (this.logStream) {
      this.logStream.end()
      this.logStream = null
    }
  }

  getLogPath(): string {
    return this.getLogFilePath()
  }

  getExistingLogPath(): string | null {
    if (this.logFile && fs.existsSync(this.logFile)) {
      return this.logFile
    }
    return null
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private getLogFilePath(): string {
    if (this.logFile) return this.logFile

    this.ensureLogDir()
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    this.logFile = path.join(this.logDir, `ai_${date}_${hours}-${minutes}.log`)

    return this.logFile
  }

  private getLogStream(): fs.WriteStream {
    if (this.logStream) return this.logStream

    const filePath = this.getLogFilePath()
    const isNewOrEmptyFile = !fs.existsSync(filePath) || fs.statSync(filePath).size === 0
    this.logStream = fs.createWriteStream(filePath, { flags: 'a', encoding: 'utf-8' })
    if (isNewOrEmptyFile) {
      this.logStream.write(`Local Path:  ${filePath.replace(/ /g, '\\ ')}\n\n`)
    }

    return this.logStream
  }

  private writeLog(level: LogLevel, category: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString()
    let logLine = `[${timestamp}] [${level}] [${category}] ${message}`

    if (data !== undefined) {
      try {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        if (!this.debugMode && dataStr.length > 2000) {
          logLine += `\n${dataStr.slice(0, 2000)}...[truncated, ${dataStr.length} chars total]`
        } else {
          logLine += `\n${dataStr}`
        }
      } catch {
        logLine += `\n[unserializable data]`
      }
    }

    logLine += '\n'

    try {
      const stream = this.getLogStream()
      stream.write(logLine)
    } catch (error) {
      console.error('[AiLogger] Failed to write log:', error)
    }

    if (level === 'WARN' || level === 'ERROR') {
      console.log(`[AI] ${message}`)
    }
  }
}

export function extractErrorInfo(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const info: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    }
    if ('cause' in error && error.cause) {
      info.cause = extractErrorInfo(error.cause)
    }
    return info
  }
  if (typeof error === 'object' && error !== null) {
    return { raw: JSON.stringify(error) }
  }
  return { message: String(error) }
}

export function extractErrorStack(error: unknown, stackLines: number = 5): string | null {
  if (error instanceof Error && error.stack) {
    const lines = error.stack.split('\n')
    return lines.slice(1, stackLines + 1).join('\n')
  }
  return null
}
