import { createGreetingService } from "@services/greeting"
import { createLoggerStub } from "@domain/logging"
import { createMetricsRegistryStub, createTracerStub } from "@domain/telemetry"
import { createClickRepositoryStub } from "@domain/greeting"

describe("GreetingService — expected errors", () => {
  const setup = () => ({
    logger: createLoggerStub(),
    metrics: createMetricsRegistryStub(),
    tracer: createTracerStub(),
    repository: createClickRepositoryStub(),
  })

  it("propagates error when logger throws", async () => {
    const deps = setup()
    deps.logger.info = () => {
      throw new Error("Logger write failed")
    }

    const svc = createGreetingService(deps)

    await expect(svc.greet()).rejects.toThrow("Logger write failed")
  })

  it("propagates error when metrics incrementCounter throws", async () => {
    const deps = setup()
    deps.metrics.incrementCounter = () => {
      throw new Error("Metrics backend unavailable")
    }

    const svc = createGreetingService(deps)

    await expect(svc.greet()).rejects.toThrow("Metrics backend unavailable")
  })

  it("propagates error when repository throws", async () => {
    const deps = setup()
    deps.repository.increment = async () => {
      throw new Error("Repository unavailable")
    }

    const svc = createGreetingService(deps)

    await expect(svc.greet()).rejects.toThrow("Repository unavailable")
  })
})
