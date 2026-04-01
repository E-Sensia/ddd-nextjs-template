export class Config {
  readonly port: number
  readonly logLevel: string
  readonly otelServiceName: string
  readonly otelServiceVersion: string

  constructor() {
    this.port = parseInt(process.env.PORT ?? "3000", 10)
    this.logLevel = process.env.LOG_LEVEL ?? "info"
    this.otelServiceName = process.env.OTEL_SERVICE_NAME ?? "hello-world-nextjs"
    this.otelServiceVersion = process.env.APP_VERSION ?? "0.1.0"
  }

  validate(): void {
    if (this.port < 1 || this.port > 65535) {
      throw new Error(`Invalid port: ${this.port}`)
    }
  }
}
