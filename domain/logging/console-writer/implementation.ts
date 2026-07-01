import type { Logger, LogLevel } from "../model"
import { getLogContext } from "../context"
import type { MetricsRegistry, Tracer } from "@domain/telemetry"

export type ConsoleLoggerDeps = {
  /** Service name stamped on every line (canonical `service` field). */
  service: string
  /** Service version stamped on every line (canonical `version` field). */
  version: string
  /** "json": one object per line (production). "console": pretty (dev). */
  format?: "json" | "console"
  metrics?: MetricsRegistry
  tracer?: Tracer
}

const writers: Record<LogLevel, (line: string) => void> = {
  debug: (line) => console.debug(line),
  info: (line) => console.info(line),
  warn: (line) => console.warn(line),
  error: (line) => console.error(line),
}

/**
 * Log-format doctrine: canonical fields (timestamp, level, service, version,
 * message) plus flat extras; conversation_id / request_id come from the
 * logging context, trace_id / span_id from the active span. `message` must
 * stay a stable constant string — data goes in the extras, never
 * interpolated into the message.
 */
export function createConsoleLogger(deps: ConsoleLoggerDeps): Logger {
  const { service, version, format = "json", metrics, tracer } = deps

  const write = (
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ) => {
    const logCtx = getLogContext()
    const traceCtx = tracer?.getContext()

    const fields: Record<string, unknown> = {
      ...(logCtx?.conversationId && {
        conversation_id: logCtx.conversationId,
      }),
      ...(logCtx?.requestId && { request_id: logCtx.requestId }),
      ...(traceCtx && {
        trace_id: traceCtx.traceId,
        span_id: traceCtx.spanId,
      }),
      ...context,
    }

    if (format === "json") {
      writers[level](
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level,
          service,
          version,
          message,
          ...fields,
        }),
      )
      return
    }

    const time = new Date().toISOString().slice(11, 23)
    const extras = Object.entries(fields)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(" ")
    writers[level](
      `${time} ${level.toUpperCase().padEnd(5)} ${message}${
        extras ? `  ${extras}` : ""
      }`,
    )
  }

  return {
    debug: (msg, ctx) => write("debug", msg, ctx),
    info: (msg, ctx) => write("info", msg, ctx),
    warn: (msg, ctx) => {
      metrics?.incrementCounter("logs", { severity: "warning" })
      write("warn", msg, ctx)
    },
    error: (msg, ctx) => {
      metrics?.incrementCounter("logs", { severity: "error" })
      write("error", msg, ctx)
    },
  }
}
