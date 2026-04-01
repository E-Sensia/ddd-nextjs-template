import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "@opentelemetry/exporter-metrics-otlp-proto",
    "@opentelemetry/sdk-metrics",
  ],
}

export default nextConfig
