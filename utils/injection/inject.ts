export type Configurator<T> = (instance: T) => void

export function inject<T>(
  factory: () => T,
  ...configurators: Configurator<T>[]
): T {
  const instance = factory()
  for (const configure of configurators) {
    configure(instance)
  }
  return instance
}
