import { Configurator } from "../../utils/injection/inject"
import { GreetingService } from "./service"
import { Logger } from "../../domain/logging/model"
import { MetricsRegistry, Tracer } from "../../domain/telemetry/model"
import { ClickRepository } from "../../domain/greeting/model"

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

export const withTracer = (
  tracer: Tracer,
): Configurator<GreetingService> => {
  return (svc) => {
    svc.tracer = tracer
  }
}

export const withRepository = (
  repository: ClickRepository,
): Configurator<GreetingService> => {
  return (svc) => {
    svc.repository = repository
  }
}
