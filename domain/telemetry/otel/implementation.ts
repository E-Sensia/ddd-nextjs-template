import { metrics } from "@opentelemetry/api"
import { MetricsRegistry, MetricAttributes } from "../model"
import type { Counter, Histogram } from "@opentelemetry/api"

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
