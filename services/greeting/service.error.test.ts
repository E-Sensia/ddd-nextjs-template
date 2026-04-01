import { inject } from "../../utils/injection/inject"
import { createGreetingService, withLogger, withMetrics } from "./inject"
import { createLoggerStub } from "../../domain/logging/stub/implementation"
import { createMetricsRegistryStub } from "../../domain/telemetry/stub/implementation"

describe("GreetingService — expected errors", () => {
  it("propagates error when logger throws", async () => {
    const metrics = createMetricsRegistryStub()
    const logger = createLoggerStub()
    // Override info to throw
    logger.info = () => {
      throw new Error("Logger write failed")
    }

    const svc = inject(
      createGreetingService,
      withLogger(logger),
      withMetrics(metrics),
    )

    await expect(svc.greet()).rejects.toThrow("Logger write failed")
  })

  it("propagates error when metrics incrementCounter throws", async () => {
    const logger = createLoggerStub()
    const metrics = createMetricsRegistryStub()
    metrics.incrementCounter = () => {
      throw new Error("Metrics backend unavailable")
    }

    const svc = inject(
      createGreetingService,
      withLogger(logger),
      withMetrics(metrics),
    )

    await expect(svc.greet()).rejects.toThrow("Metrics backend unavailable")
  })
})
