/**
 * Encodes the DDD dependency rules — an upward import fails the build:
 *
 *   main ──> config, domain/*, services/*, src (wiring accessors), utils
 *   src (server) ──> services, domain objects, utils, main (accessors)
 *   services ──> domain (ports + objects), utils
 *   domain ──> utils, domain/shared
 *   utils ──> nothing
 */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "domain-not-upward",
      comment: "domain never imports services, the server layer or main",
      severity: "error",
      from: { path: "^domain" },
      to: { path: "^(services|src|main\\.ts$)" },
    },
    {
      name: "services-not-upward",
      comment: "services never import the server layer or main",
      severity: "error",
      from: { path: "^services" },
      to: { path: "^(src|main\\.ts$)" },
    },
    {
      name: "utils-depend-on-nothing",
      comment: "utils is foundational: no app-level dependencies",
      severity: "error",
      from: { path: "^utils" },
      to: { path: "^(config|domain|services|src|main\\.ts$)" },
    },
    {
      name: "only-main-imports-config",
      comment: "services and domain receive primitives, never the config",
      severity: "error",
      from: { path: "^(domain|services|src|utils)" },
      to: { path: "^config" },
    },
    {
      name: "server-not-into-adapters",
      comment:
        "the server layer uses domain models, never concrete adapters or stubs — main wires those",
      severity: "error",
      from: { path: "^src" },
      to: { path: "^domain/[^/]+/(memory|otel|console-writer|stub)/" },
    },
    {
      name: "main-not-into-server-internals",
      comment: "main wires services; it never reaches into the Next.js app",
      severity: "error",
      from: { path: "^main\\.ts$" },
      to: { path: "^src" },
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: {
      path: "node_modules|\\.next|coverage|playwright-report|test-results",
    },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
  },
}
