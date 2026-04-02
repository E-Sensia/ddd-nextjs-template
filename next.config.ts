import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@opentelemetry/api",
    "@opentelemetry/sdk-node",
    "@opentelemetry/sdk-metrics",
    "@opentelemetry/exporter-metrics-otlp-proto",
  ],
}

export default nextConfig
