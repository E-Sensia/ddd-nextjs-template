// --- Objects ---

export type MetricAttributes = Record<string, string | number | boolean>

// --- Ports ---

export type MetricsRegistry = {
  incrementCounter: (name: string, attributes?: MetricAttributes) => void
  recordHistogram: (
    name: string,
    value: number,
    attributes?: MetricAttributes,
  ) => void
}

export type TraceContext = {
  traceId: string
  spanId: string
}

export type Tracer = {
  span: <T>(name: string, fn: () => Promise<T>) => Promise<T>
  getContext: () => TraceContext | null
}
