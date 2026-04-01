import { Logger } from "../../domain/logging/model"
import { MetricsRegistry } from "../../domain/telemetry/model"
import {
  createGreetingResult,
  GreetingResult,
} from "../../domain/greeting/model"

export class GreetingService {
  logger!: Logger
  metrics!: MetricsRegistry
  private clickCount: number = 0

  async greet(): Promise<GreetingResult> {
    this.clickCount++

    this.logger.info("Button clicked", { clickCount: this.clickCount })
    this.metrics.incrementCounter("greeting.button_clicks", {
      action: "greet",
    })

    return createGreetingResult(this.clickCount)
  }

  getClickCount(): number {
    return this.clickCount
  }
}
