import { Config } from "@config/config"
import { createConsoleLogger, type Logger } from "@domain/logging"
import {
  createOtelMetricsRegistry,
  createOtelTracer,
  type MetricsRegistry,
  type Tracer,
} from "@domain/telemetry"
import { createInMemoryClickRepository } from "@domain/greeting"
import { createGreetingService, type GreetingService } from "@services/greeting"

let greetingService: GreetingService
let metricsRegistry: MetricsRegistry
let tracerInstance: Tracer
let loggerInstance: Logger

export function getGreetingService(): GreetingService {
  if (!greetingService) {
    bootstrap()
  }
  return greetingService
}

export function getMetrics(): MetricsRegistry {
  if (!metricsRegistry) {
    bootstrap()
  }
  return metricsRegistry
}

export function getTracer(): Tracer {
  if (!tracerInstance) {
    bootstrap()
  }
  return tracerInstance
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    bootstrap()
  }
  return loggerInstance
}

function bootstrap() {
  const cfg = new Config()

  metricsRegistry = createOtelMetricsRegistry(
    cfg.otelServiceName,
    cfg.otelServiceVersion,
  )
  tracerInstance = createOtelTracer(cfg.otelServiceName)
  loggerInstance = createConsoleLogger({
    metrics: metricsRegistry,
    tracer: tracerInstance,
  })
  const repository = createInMemoryClickRepository()

  greetingService = createGreetingService({
    logger: loggerInstance,
    metrics: metricsRegistry,
    tracer: tracerInstance,
    repository,
  })
}
