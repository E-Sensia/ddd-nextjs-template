import { Logger } from "@domain/logging"
import { MetricsRegistry, Tracer } from "@domain/telemetry"
import { ClickRepository, createGreetingResult, GreetingResult } from "@domain/greeting"

export type GreetingServiceDeps = {
  logger: Logger
  metrics: MetricsRegistry
  tracer: Tracer
  repository: ClickRepository
}

export class GreetingService {
  private readonly logger: Logger
  private readonly metrics: MetricsRegistry
  private readonly tracer: Tracer
  private readonly repository: ClickRepository

  constructor(deps: GreetingServiceDeps) {
    this.logger = deps.logger
    this.metrics = deps.metrics
    this.tracer = deps.tracer
    this.repository = deps.repository
  }

  async greet(): Promise<GreetingResult> {
    return this.tracer.span("GreetingService.greet", async () => {
      const clickCount = await this.repository.increment()

      this.logger.info("Button clicked", { clickCount })
      this.metrics.incrementCounter("greeting.button_clicks", {
        action: "greet",
      })

      return createGreetingResult(clickCount)
    })
  }

  async getClickCount(): Promise<number> {
    return this.repository.getCount()
  }
}
