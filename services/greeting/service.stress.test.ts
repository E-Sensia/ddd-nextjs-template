import { createGreetingService } from "./service"
import { createLoggerStub } from "../../domain/logging/stub/implementation"
import { createMetricsRegistryStub, createTracerStub } from "../../domain/telemetry/stub/implementation"
import { createClickRepositoryStub } from "../../domain/greeting/stub/implementation"

describe("GreetingService — stress & unexpected", () => {
  const setup = () => {
    const logger = createLoggerStub()
    const metrics = createMetricsRegistryStub()
    const tracer = createTracerStub()
    const repository = createClickRepositoryStub()
    const svc = createGreetingService({ logger, metrics, tracer, repository })
    return { svc, logger, metrics, repository }
  }

  it("handles 50 concurrent greet calls", async () => {
    const { svc, metrics } = setup()

    const calls = Array.from({ length: 50 }, () => svc.greet())
    const results = await Promise.all(calls)

    expect(results).toHaveLength(50)
    expect(await svc.getClickCount()).toBe(50)
    expect(metrics.counters).toHaveLength(50)
  })

  it("handles logger throwing intermittently", async () => {
    const { svc, logger } = setup()
    let callCount = 0
    logger.info = () => {
      callCount++
      if (callCount === 3) {
        throw new Error("Intermittent log failure")
      }
    }

    await svc.greet()
    await svc.greet()
    await expect(svc.greet()).rejects.toThrow("Intermittent log failure")
  })

  it("handles metrics throwing unexpected error type", async () => {
    const { svc, metrics } = setup()
    metrics.incrementCounter = () => {
      throw "string error"
    }

    await expect(svc.greet()).rejects.toBe("string error")
  })
})
