import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

const exportIntervalMillis = parseInt(
  process.env.OTEL_METRIC_EXPORT_INTERVAL ?? "5000",
  10,
)

const metricExporter = new OTLPMetricExporter()

const sdk = new NodeSDK({
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis,
    }),
  ],
})

sdk.start()

console.log(
  `[OTEL] Metrics SDK started — exporting every ${exportIntervalMillis}ms`,
)
