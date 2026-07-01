import { afterEach, describe, expect, it, vi } from "vitest"
import { createConsoleLogger } from "./implementation"
import { runWithLogContext } from "../context"
import { asConversationId, asRequestId } from "../../shared/types"
import { createMetricsRegistryStub } from "../../telemetry/stub/implementation"

const captureConsole = () => {
  const lines: Record<string, string[]> = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  }
  for (const level of ["debug", "info", "warn", "error"] as const) {
    vi.spyOn(console, level).mockImplementation((line: unknown) => {
      lines[level].push(String(line))
    })
  }
  return lines
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("createConsoleLogger — json format", () => {
  it("stamps the canonical fields on every line", () => {
    const lines = captureConsole()
    const logger = createConsoleLogger({ service: "greeter", version: "1.2.3" })

    logger.info("inference completed", { duration_ms: 812 })

    const entry = JSON.parse(lines.info[0]) as Record<string, unknown>
    expect(entry).toMatchObject({
      level: "info",
      service: "greeter",
      version: "1.2.3",
      message: "inference completed",
      duration_ms: 812,
    })
    expect(String(entry.timestamp)).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    )
  })

  it("carries conversation_id and request_id from the logging context", () => {
    const lines = captureConsole()
    const logger = createConsoleLogger({ service: "greeter", version: "1.2.3" })

    runWithLogContext(
      {
        conversationId: asConversationId("c1b2a3d4"),
        requestId: asRequestId("req-9f3a"),
      },
      () => logger.info("call step"),
    )

    const entry = JSON.parse(lines.info[0]) as Record<string, unknown>
    expect(entry.conversation_id).toBe("c1b2a3d4")
    expect(entry.request_id).toBe("req-9f3a")
  })

  it("omits correlation fields outside a logging context", () => {
    const lines = captureConsole()
    const logger = createConsoleLogger({ service: "greeter", version: "1.2.3" })

    logger.info("health checked")

    const entry = JSON.parse(lines.info[0]) as Record<string, unknown>
    expect(entry).not.toHaveProperty("conversation_id")
    expect(entry).not.toHaveProperty("request_id")
  })

  it("logs each level through its console writer", () => {
    const lines = captureConsole()
    const logger = createConsoleLogger({ service: "greeter", version: "1.2.3" })

    logger.debug("debug line")
    logger.warn("warn line")
    logger.error("error line")

    expect(JSON.parse(lines.debug[0]).level).toBe("debug")
    expect(JSON.parse(lines.warn[0]).level).toBe("warn")
    expect(JSON.parse(lines.error[0]).level).toBe("error")
  })

  it("increments the logs counter on warn and error", () => {
    captureConsole()
    const metrics = createMetricsRegistryStub()
    const logger = createConsoleLogger({
      service: "greeter",
      version: "1.2.3",
      metrics,
    })

    logger.warn("degraded")
    logger.error("failed")

    expect(metrics.counters).toEqual([
      { name: "logs", attributes: { severity: "warning" } },
      { name: "logs", attributes: { severity: "error" } },
    ])
  })
})

describe("createConsoleLogger — console format", () => {
  it("pretty-prints message and flat extras", () => {
    const lines = captureConsole()
    const logger = createConsoleLogger({
      service: "greeter",
      version: "1.2.3",
      format: "console",
    })

    runWithLogContext({ conversationId: asConversationId("c1b2") }, () =>
      logger.info("inference completed", { model: "whisperx" }),
    )

    expect(lines.info[0]).toMatch(
      /^\d{2}:\d{2}:\d{2}\.\d{3} INFO {2}inference completed {2}conversation_id=c1b2 model=whisperx$/,
    )
  })
})
