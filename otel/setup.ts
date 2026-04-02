import { NodeSDK } from "@opentelemetry/sdk-node"

const OTEL_KEY = Symbol.for("otel.sdk")

type OtelGlobal = typeof globalThis & { [key: symbol]: NodeSDK }

if (!(globalThis as OtelGlobal)[OTEL_KEY]) {
  const sdk = new NodeSDK({})
  sdk.start()
  ;(globalThis as OtelGlobal)[OTEL_KEY] = sdk

  console.log("[OTEL] SDK started")
}

export async function shutdown(): Promise<void> {
  const sdk = (globalThis as OtelGlobal)[OTEL_KEY]
  if (!sdk) return
  console.log("[OTEL] Shutting down SDK...")
  await sdk.shutdown()
  delete (globalThis as OtelGlobal)[OTEL_KEY]
  console.log("[OTEL] SDK shut down.")
}
