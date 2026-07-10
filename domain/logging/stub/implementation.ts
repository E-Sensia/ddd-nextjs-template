import { type Logger, type LogEntry, createLogEntry } from "../model"

export function createLoggerStub(): Logger & { entries: LogEntry[] } {
  const entries: LogEntry[] = []

  const log =
    (level: LogEntry["level"]) =>
    (message: string, context?: Record<string, unknown>) => {
      entries.push(createLogEntry(level, message, context))
    }

  return {
    entries,
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
  }
}
