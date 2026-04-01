import { Config } from "./config/config"
import { inject } from "./utils/injection/inject"
import { createConsoleLogger } from "./domain/logging/console-writer/implementation"
import { createOtelMetricsRegistry } from "./domain/telemetry/otel/implementation"
import {
  createGreetingService,
  withLogger,
  withMetrics,
} from "./services/greeting/inject"
import type { GreetingService } from "./services/greeting/service"
import { metrics } from "@opentelemetry/api"

let greetingService: GreetingService

export function getGreetingService(): GreetingService {
  if (!greetingService) {
    bootstrap()
  }
  return greetingService
}

function bootstrap() {
  const cfg = new Config()
  cfg.validate()

  const metricsRegistry = createOtelMetricsRegistry(
    cfg.otelServiceName,
    cfg.otelServiceVersion,
  )

  const logCounter = metrics.getMeter(cfg.otelServiceName).createCounter("logs")
  const logger = createConsoleLogger(logCounter)

  greetingService = inject(
    createGreetingService,
    withLogger(logger),
    withMetrics(metricsRegistry),
  )
}
