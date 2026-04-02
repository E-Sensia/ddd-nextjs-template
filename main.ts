import { Config } from "./config/config"
import { inject } from "./utils/injection/inject"
import { createConsoleLogger } from "./domain/logging/console-writer/implementation"
import {
  createOtelMetricsRegistry,
  createOtelTracer,
} from "./domain/telemetry/otel/implementation"
import { createInMemoryClickRepository } from "./domain/greeting/memory/implementation"
import {
  createGreetingService,
  withLogger,
  withMetrics,
  withTracer,
  withRepository,
} from "./services/greeting/inject"
import type { GreetingService } from "./services/greeting/service"

let greetingService: GreetingService

export function getGreetingService(): GreetingService {
  if (!greetingService) {
    bootstrap()
  }
  return greetingService
}

function bootstrap() {
  const cfg = new Config()

  const metricsRegistry = createOtelMetricsRegistry(
    cfg.otelServiceName,
    cfg.otelServiceVersion,
  )

  const tracer = createOtelTracer(cfg.otelServiceName)
  const logger = createConsoleLogger({ metrics: metricsRegistry, tracer })
  const repository = createInMemoryClickRepository()

  greetingService = inject(
    createGreetingService,
    withLogger(logger),
    withMetrics(metricsRegistry),
    withTracer(tracer),
    withRepository(repository),
  )
}
