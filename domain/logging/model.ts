// --- Objects ---

export type LogLevel = "log" | "info" | "warn" | "error" | "debug"

export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
}

export function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  return { level, message, timestamp: new Date(), context }
}

// --- Port ---

export type Logger = {
  log: (message: string, context?: Record<string, unknown>) => void
  info: (message: string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, context?: Record<string, unknown>) => void
  debug: (message: string, context?: Record<string, unknown>) => void
}
