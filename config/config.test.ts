import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Config } from "./config"

const ENV_KEYS = [
  "PORT",
  "LOG_LEVEL",
  "LOG_FORMAT",
  "OTEL_SERVICE_NAME",
  "APP_VERSION",
] as const

let saved: Record<string, string | undefined>

beforeEach(() => {
  saved = {}
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  vi.unstubAllEnvs()
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = saved[key]
    }
  }
})

describe("Config", () => {
  it("applies defaults when the environment is empty", () => {
    const cfg = new Config()

    expect(cfg.port).toBe(3000)
    expect(cfg.logLevel).toBe("info")
    expect(cfg.otelServiceName).toBe("my-service")
    expect(cfg.otelServiceVersion).toBe("0.1.0")
  })

  it("reads values from the environment", () => {
    process.env.PORT = "8080"
    process.env.LOG_LEVEL = "debug"
    process.env.OTEL_SERVICE_NAME = "greeter"
    process.env.APP_VERSION = "1.2.3"

    const cfg = new Config()

    expect(cfg.port).toBe(8080)
    expect(cfg.logLevel).toBe("debug")
    expect(cfg.otelServiceName).toBe("greeter")
    expect(cfg.otelServiceVersion).toBe("1.2.3")
  })

  it("defaults log format to console outside production", () => {
    expect(new Config().logFormat).toBe("console")
  })

  it("defaults log format to json in production", () => {
    vi.stubEnv("NODE_ENV", "production")
    expect(new Config().logFormat).toBe("json")
  })

  it("lets LOG_FORMAT override the NODE_ENV default", () => {
    vi.stubEnv("NODE_ENV", "production")
    process.env.LOG_FORMAT = "console"
    expect(new Config().logFormat).toBe("console")
  })

  it("rejects an out-of-range port", () => {
    process.env.PORT = "70000"
    expect(() => new Config()).toThrow()
  })

  it("rejects an unknown log level", () => {
    process.env.LOG_LEVEL = "verbose"
    expect(() => new Config()).toThrow()
  })

  it("rejects an unknown log format", () => {
    process.env.LOG_FORMAT = "xml"
    expect(() => new Config()).toThrow()
  })
})
