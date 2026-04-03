import { z } from "zod"

const LogLevel = z.enum(["log", "info", "warn", "error", "debug"])

const configSchema = z.object({
  port: z.coerce.number().int().min(1).max(65535).default(3000),
  logLevel: LogLevel.default("info"),
  otelServiceName: z.string().min(1).default("my-service"),
  otelServiceVersion: z.string().min(1).default("0.1.0"),
})

export type ConfigValues = z.infer<typeof configSchema>

export class Config {
  readonly port: number
  readonly logLevel: z.infer<typeof LogLevel>
  readonly otelServiceName: string
  readonly otelServiceVersion: string

  constructor() {
    const parsed = configSchema.parse({
      port: process.env.PORT,
      logLevel: process.env.LOG_LEVEL,
      otelServiceName: process.env.OTEL_SERVICE_NAME,
      otelServiceVersion: process.env.APP_VERSION,
    })

    this.port = parsed.port
    this.logLevel = parsed.logLevel
    this.otelServiceName = parsed.otelServiceName
    this.otelServiceVersion = parsed.otelServiceVersion
  }
}
