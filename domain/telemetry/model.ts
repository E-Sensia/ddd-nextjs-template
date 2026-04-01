// --- Objects ---

export type MetricAttributes = Record<string, string | number | boolean>

// --- Port ---

export type MetricsRegistry = {
  incrementCounter: (name: string, attributes?: MetricAttributes) => void
  recordHistogram: (
    name: string,
    value: number,
    attributes?: MetricAttributes,
  ) => void
}
