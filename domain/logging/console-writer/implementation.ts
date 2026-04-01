import { Logger } from "../model"
import type { Counter } from "@opentelemetry/api"

function serializeToSingleLine(value: unknown): string {
  if (value === null) return "null"
  if (value === undefined) return "undefined"

  if (value instanceof Error) {
    return JSON.stringify({
      name: value.name,
      message: value.message,
      stack: value.stack,
    })
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return JSON.stringify({ error: "Failed to serialize object" })
    }
  }

  return String(value)
}

export function createConsoleLogger(logCounter?: Counter): Logger {
  const write = (
    level: string,
    message: string,
    context?: Record<string, unknown>,
  ) => {
    const timestamp = new Date().toISOString()
    const payload = context
      ? `${message} ${serializeToSingleLine(context)}`
      : message
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${payload}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(console as any)[level](logLine)
  }

  return {
    log: (msg, ctx) => write("log", msg, ctx),
    info: (msg, ctx) => write("info", msg, ctx),
    warn: (msg, ctx) => {
      logCounter?.add(1, { severity: "warning" })
      write("warn", msg, ctx)
    },
    error: (msg, ctx) => {
      logCounter?.add(1, { severity: "error" })
      write("error", msg, ctx)
    },
    debug: (msg, ctx) => write("debug", msg, ctx),
  }
}
