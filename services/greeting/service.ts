import { Logger } from "../../domain/logging/model"
import { MetricsRegistry, Tracer } from "../../domain/telemetry/model"
import {
  ClickRepository,
  createGreetingResult,
  GreetingResult,
} from "../../domain/greeting/model"

export class GreetingService {
  logger!: Logger
  metrics!: MetricsRegistry
  tracer!: Tracer
  repository!: ClickRepository

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
