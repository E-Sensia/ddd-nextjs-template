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
}

export default config
