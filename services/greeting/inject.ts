import { Configurator } from "../../utils/injection/inject"
import { GreetingService } from "./service"
import { Logger } from "../../domain/logging/model"
import { MetricsRegistry } from "../../domain/telemetry/model"

export const createGreetingService = (): GreetingService =>
  new GreetingService()

export const withLogger = (logger: Logger): Configurator<GreetingService> => {
  return (svc) => {
    svc.logger = logger
  }
}

export const withMetrics = (
  metrics: MetricsRegistry,
): Configurator<GreetingService> => {
  return (svc) => {
    svc.metrics = metrics
  }
}
