import { getMetrics } from "../../../../main"
import { withRequestContext } from "../../../server/request-context"
import { withRequestMetrics } from "../../../server/request-metrics"

export const GET = withRequestContext(
  withRequestMetrics(() => {
    getMetrics().incrementCounter("health.calls")
    return Response.json({ status: "UP" })
  }),
)
