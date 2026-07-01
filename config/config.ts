import { z } from "zod"

const LogLevel = z.enum(["debug", "info", "warn", "error"])
const LogFormat = z.enum(["json", "console"])

const configSchema = z.object({
  port: z.coerce.number().int().min(1).max(65535).default(3000),
  logLevel: LogLevel.default("info"),
  logFormat: LogFormat,
  otelServiceName: z.string().min(1).default("my-service"),
  otelServiceVersion: z.string().min(1).default("0.1.0"),
})

export type ConfigValues = z.infer<typeof configSchema>

export class Config {
  readonly port: number
  readonly logLevel: z.infer<typeof LogLevel>
  readonly logFormat: z.infer<typeof LogFormat>
  readonly otelServiceName: string
  readonly otelServiceVersion: string

  constructor() {
    const parsed = configSchema.parse({
      port: process.env.PORT,
      logLevel: process.env.LOG_LEVEL,
      // JSON one-per-line in production, pretty console everywhere else —
      // overridable explicitly with LOG_FORMAT.
      logFormat:
        process.env.LOG_FORMAT ??
        (process.env.NODE_ENV === "production" ? "json" : "console"),
      otelServiceName: process.env.OTEL_SERVICE_NAME,
      otelServiceVersion: process.env.APP_VERSION,
    })

    this.port = parsed.port
    this.logLevel = parsed.logLevel
    this.logFormat = parsed.logFormat
    this.otelServiceName = parsed.otelServiceName
    this.otelServiceVersion = parsed.otelServiceVersion
  }
}
