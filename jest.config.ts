import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/domain", "<rootDir>/services"],
  moduleNameMapper: {
    "^@domain/(.*)$": "<rootDir>/domain/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
    "^@utils$": "<rootDir>/utils",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
    "^@config/(.*)$": "<rootDir>/config/$1",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/domain/.*/otel/",
    "/domain/.*/console-writer/",
    "/domain/.*/memory/",
    "/index\\.ts$",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

export default config
