import { Logger } from "../model"
import { MetricsRegistry } from "../../telemetry/model"

export function createConsoleLogger(metrics?: MetricsRegistry): Logger {
  const write = (
    level: string,
    message: string,
    context?: Record<string, unknown>,
  ) => {
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...context,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(console as any)[level](entry)
  }

  return {
    log: (msg, ctx) => write("log", msg, ctx),
    info: (msg, ctx) => write("info", msg, ctx),
    warn: (msg, ctx) => {
      metrics?.incrementCounter("logs", { severity: "warning" })
      write("warn", msg, ctx)
    },
    error: (msg, ctx) => {
      metrics?.incrementCounter("logs", { severity: "error" })
      write("error", msg, ctx)
    },
    debug: (msg, ctx) => write("debug", msg, ctx),
  }
}
