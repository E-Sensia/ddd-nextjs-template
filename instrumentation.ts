export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { shutdown } = await import("./otel/setup")

    let shutdownCalled = false
    const gracefulShutdown = async () => {
      if (shutdownCalled) return
      shutdownCalled = true
      await shutdown()
      process.exit(0)
    }

    process.on("SIGTERM", gracefulShutdown)
    process.on("SIGINT", gracefulShutdown)
  }
}
