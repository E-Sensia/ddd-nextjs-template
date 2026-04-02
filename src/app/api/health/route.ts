import { metrics } from "@opentelemetry/api"

const meter = metrics.getMeter("hello-world-nextjs")
const counter = meter.createCounter("health.calls", {
  description: "Number of health check calls",
})

export async function GET() {
  counter.add(1)
  return Response.json({ status: "UP" })
}
