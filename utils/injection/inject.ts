/**
 * Dependency injection helpers.
 *
 * Required dependencies travel in a typed `Deps` object passed to the service
 * constructor — an incomplete literal does not compile, so wiring completeness
 * is owned by the compiler (no runtime validation needed).
 *
 * Functional options (`with...` configurators) exist ONLY for optional
 * tunables with sane defaults, applied by `applyOptions` in the service
 * factory.
 */
export type Configurator<T> = (instance: T) => void

export function applyOptions<T>(instance: T, options: Configurator<T>[]): T {
  for (const configure of options) {
    configure(instance)
  }
  return instance
}
