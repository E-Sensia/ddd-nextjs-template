import { Config } from "./config/config"
import { createConsoleLogger } from "./domain/logging/console-writer/implementation"
import {
  createOtelMetricsRegistry,
  createOtelTracer,
} from "./domain/telemetry/otel/implementation"
import { createInMemoryClickRepository } from "./domain/greeting/memory/implementation"
import {
  createGreetingService,
  GreetingService,
} from "./services/greeting/service"

let greetingService: GreetingService

export function getGreetingService(): GreetingService {
  if (!greetingService) {
    bootstrap()
  }
  return greetingService
}

function bootstrap() {
  const cfg = new Config()

  const metrics = createOtelMetricsRegistry(
    cfg.otelServiceName,
    cfg.otelServiceVersion,
  )
  const tracer = createOtelTracer(cfg.otelServiceName)
  const logger = createConsoleLogger({ metrics, tracer })
  const repository = createInMemoryClickRepository()

  greetingService = createGreetingService({
    logger,
    metrics,
    tracer,
    repository,
  })
}
