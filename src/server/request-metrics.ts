import type { NextRequest } from "next/server"
import { getMetrics } from "../../main"
import type { RouteHandler } from "./request-context"

export function withRequestMetrics(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest) => {
    const start = performance.now()
    const response = await handler(request)
    const durationMs = performance.now() - start

    const metrics = getMetrics()
    const attrs = {
      method: request.method,
      path: request.nextUrl.pathname,
      status: String(response.status),
    }

    metrics.incrementCounter("http.server.requests", attrs)
    metrics.recordHistogram("http.server.duration_ms", durationMs, attrs)

    return response
  }
}
