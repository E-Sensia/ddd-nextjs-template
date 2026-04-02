import { Logger } from "../../domain/logging/model"
import { MetricsRegistry, Tracer } from "../../domain/telemetry/model"
import {
  ClickRepository,
  createGreetingResult,
  GreetingResult,
} from "../../domain/greeting/model"

export type GreetingServiceDeps = {
  logger: Logger
  metrics: MetricsRegistry
  tracer: Tracer
  repository: ClickRepository
}

export type GreetingService = {
  logger: Logger
  greet: () => Promise<GreetingResult>
  getClickCount: () => Promise<number>
}

export function createGreetingService(
  deps: GreetingServiceDeps,
): GreetingService {
  const { logger, metrics, tracer, repository } = deps

  return {
    logger,
    greet: () =>
      tracer.span("GreetingService.greet", async () => {
        const clickCount = await repository.increment()

        logger.info("Button clicked", { clickCount })
        metrics.incrementCounter("greeting.button_clicks", {
          action: "greet",
        })

        return createGreetingResult(clickCount)
      }),
    getClickCount: () => repository.getCount(),
  }
}
