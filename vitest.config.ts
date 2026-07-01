import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@domain": new URL("./domain", import.meta.url).pathname,
      "@services": new URL("./services", import.meta.url).pathname,
      "@utils": new URL("./utils", import.meta.url).pathname,
      "@config": new URL("./config", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    include: [
      "domain/**/*.test.ts",
      "services/**/*.test.ts",
      "config/**/*.test.ts",
      "utils/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      exclude: [
        "domain/**/otel/**",
        "domain/**/console-writer/**",
        "domain/**/memory/**",
        "**/index.ts",
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
