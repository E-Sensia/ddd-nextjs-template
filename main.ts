import { Config } from "./config/config"
import { inject } from "./utils/injection/inject"
import { createConsoleLogger } from "./domain/logging/console-writer/implementation"
import { createOtelMetricsRegistry } from "./domain/telemetry/otel/implementation"
import { createInMemoryClickRepository } from "./domain/greeting/memory/implementation"
import {
  createGreetingService,
  withLogger,
  withMetrics,
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

  const logger = createConsoleLogger(metricsRegistry)

  const repository = createInMemoryClickRepository()

  greetingService = inject(
    createGreetingService,
    withLogger(logger),
    withMetrics(metricsRegistry),
    withRepository(repository),
  )
}
