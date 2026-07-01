import type { Logger } from "@domain/logging"
import type { MetricsRegistry, Tracer } from "@domain/telemetry"

type LoggerDeps = {
  metrics?: MetricsRegistry
  tracer?: Tracer
}

export function createConsoleLogger(deps?: LoggerDeps): Logger {
  const { metrics, tracer } = deps ?? {}

  const write = (
    level: string,
    message: string,
    context?: Record<string, unknown>,
  ) => {
    const traceCtx = tracer?.getContext()
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...context,
      ...(traceCtx && { traceId: traceCtx.traceId, spanId: traceCtx.spanId }),
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
