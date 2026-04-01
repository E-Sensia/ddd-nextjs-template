import { MetricsRegistry, MetricAttributes } from "../model"

type RecordedMetric = {
  name: string
  value?: number
  attributes?: MetricAttributes
}

export function createMetricsRegistryStub(): MetricsRegistry & {
  counters: RecordedMetric[]
  histograms: RecordedMetric[]
} {
  const counters: RecordedMetric[] = []
  const histograms: RecordedMetric[] = []

  return {
    counters,
    histograms,
    incrementCounter: (name, attributes) => {
      counters.push({ name, attributes })
    },
    recordHistogram: (name, value, attributes) => {
      histograms.push({ name, value, attributes })
    },
  }
}
