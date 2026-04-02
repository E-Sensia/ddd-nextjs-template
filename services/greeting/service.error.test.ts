import { inject } from "../../utils/injection/inject"
import {
  createGreetingService,
  withLogger,
  withMetrics,
  withTracer,
  withRepository,
} from "./inject"
import { createLoggerStub } from "../../domain/logging/stub/implementation"
import {
  createMetricsRegistryStub,
  createTracerStub,
} from "../../domain/telemetry/stub/implementation"
import { createClickRepositoryStub } from "../../domain/greeting/stub/implementation"

describe("GreetingService — expected errors", () => {
  const setup = () => {
    const logger = createLoggerStub()
    const metrics = createMetricsRegistryStub()
    const tracer = createTracerStub()
    const repository = createClickRepositoryStub()
    return { logger, metrics, tracer, repository }
  }

  it("propagates error when logger throws", async () => {
    const { metrics, tracer, repository } = setup()
    const logger = createLoggerStub()
    logger.info = () => {
      throw new Error("Logger write failed")
    }

    const svc = inject(
      createGreetingService,
      withLogger(logger),
      withMetrics(metrics),
      withTracer(tracer),
      withRepository(repository),
    )

    await expect(svc.greet()).rejects.toThrow("Logger write failed")
  })

  it("propagates error when metrics incrementCounter throws", async () => {
    const { logger, tracer, repository } = setup()
    const metrics = createMetricsRegistryStub()
    metrics.incrementCounter = () => {
      throw new Error("Metrics backend unavailable")
    }

    const svc = inject(
      createGreetingService,
      withLogger(logger),
      withMetrics(metrics),
      withTracer(tracer),
      withRepository(repository),
    )

    await expect(svc.greet()).rejects.toThrow("Metrics backend unavailable")
  })

  it("propagates error when repository throws", async () => {
    const { logger, metrics, tracer } = setup()
    const repository = createClickRepositoryStub()
    repository.increment = async () => {
      throw new Error("Repository unavailable")
    }

    const svc = inject(
      createGreetingService,
      withLogger(logger),
      withMetrics(metrics),
      withTracer(tracer),
      withRepository(repository),
    )

    await expect(svc.greet()).rejects.toThrow("Repository unavailable")
  })
})
