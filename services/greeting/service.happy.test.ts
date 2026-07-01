import { describe, expect, it } from "vitest"
import { createGreetingService } from "@services/greeting"
import { createLoggerStub } from "@domain/logging"
import { createMetricsRegistryStub, createTracerStub } from "@domain/telemetry"
import { createClickRepositoryStub } from "@domain/greeting"

describe("GreetingService — happy paths", () => {
  const setup = () => {
    const logger = createLoggerStub()
    const metrics = createMetricsRegistryStub()
    const tracer = createTracerStub()
    const repository = createClickRepositoryStub()
    const svc = createGreetingService({ logger, metrics, tracer, repository })
    return { svc, logger, metrics, tracer, repository }
  }

  it("returns a greeting with click count 1 on first call", async () => {
    const { svc } = setup()
    const result = await svc.greet()

    expect(result.clickCount).toBe(1)
    expect(result.message).toBe("Hello World! First click!")
    expect(result.timestamp).toBeInstanceOf(Date)
  })

  it("increments click count on subsequent calls", async () => {
    const { svc } = setup()

    await svc.greet()
    const result = await svc.greet()

    expect(result.clickCount).toBe(2)
    expect(result.message).toBe("Hello World! Click #2")
  })

  it("logs the button click", async () => {
    const { svc, logger } = setup()
    await svc.greet()

    expect(logger.entries).toHaveLength(1)
    expect(logger.entries[0].message).toBe("Button clicked")
    expect(logger.entries[0].context).toEqual({ clickCount: 1 })
  })

  it("increments the OTEL counter", async () => {
    const { svc, metrics } = setup()
    await svc.greet()

    expect(metrics.counters).toHaveLength(1)
    expect(metrics.counters[0].name).toBe("greeting.button_clicks")
    expect(metrics.counters[0].attributes).toEqual({ action: "greet" })
  })

  it("creates a trace span", async () => {
    const { svc, tracer } = setup()
    await svc.greet()

    expect(tracer.spans).toEqual(["GreetingService.greet"])
  })

  it("tracks click count via getClickCount", async () => {
    const { svc } = setup()

    expect(await svc.getClickCount()).toBe(0)
    await svc.greet()
    expect(await svc.getClickCount()).toBe(1)
    await svc.greet()
    expect(await svc.getClickCount()).toBe(2)
  })

  it("delegates state to repository", async () => {
    const { svc, repository } = setup()

    await svc.greet()
    await svc.greet()

    expect(repository.count).toBe(2)
  })
})
