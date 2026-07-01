import {
  metrics,
  trace,
  SpanStatusCode,
  isSpanContextValid,
} from "@opentelemetry/api"
import type { MetricsRegistry, MetricAttributes, Tracer } from "../model"
import type { Counter, Histogram } from "@opentelemetry/api"
import { asSpanId, asTraceId } from "../../shared/types"

export function createOtelMetricsRegistry(
  serviceName: string,
  version: string,
): MetricsRegistry {
  const meter = metrics.getMeter(serviceName, version)
  const counters = new Map<string, Counter>()
  const histograms = new Map<string, Histogram>()

  return {
    incrementCounter: (name: string, attributes?: MetricAttributes) => {
      if (!counters.has(name)) {
        counters.set(name, meter.createCounter(name))
      }
      counters.get(name)!.add(1, attributes)
    },
    recordHistogram: (
      name: string,
      value: number,
      attributes?: MetricAttributes,
    ) => {
      if (!histograms.has(name)) {
        histograms.set(name, meter.createHistogram(name))
      }
      histograms.get(name)!.record(value, attributes)
    },
  }
}

export function createOtelTracer(serviceName: string): Tracer {
  const tracer = trace.getTracer(serviceName)

  return {
    span: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      return tracer.startActiveSpan(name, async (span) => {
        try {
          const result = await fn()
          span.end()
          return result
        } catch (err) {
          span.setStatus({ code: SpanStatusCode.ERROR })
          if (err instanceof Error) span.recordException(err)
          span.end()
          throw err
        }
      })
    },
    getContext: () => {
      const span = trace.getActiveSpan()
      if (!span) return null
      const ctx = span.spanContext()
      if (!isSpanContextValid(ctx)) return null
      return { traceId: asTraceId(ctx.traceId), spanId: asSpanId(ctx.spanId) }
    },
  }
}
