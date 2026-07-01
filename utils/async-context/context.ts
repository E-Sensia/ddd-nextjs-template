import { AsyncLocalStorage } from "node:async_hooks"

/**
 * Generic AsyncLocalStorage wrapper: run a unit of work with a context value
 * and read it back from anywhere inside that unit of work, without threading
 * it through signatures. Generic and dependency-free — typed instances are
 * declared where they belong (e.g. the logging context in domain/logging).
 */
export type AsyncContext<T> = {
  run: <R>(value: T, fn: () => R) => R
  get: () => T | undefined
}

export function createAsyncContext<T>(): AsyncContext<T> {
  const storage = new AsyncLocalStorage<T>()

  return {
    run: (value, fn) => storage.run(value, fn),
    get: () => storage.getStore(),
  }
}
