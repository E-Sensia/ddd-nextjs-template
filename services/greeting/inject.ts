import { applyOptions, type Configurator } from "@utils"
import { GreetingService, type GreetingServiceDeps } from "./service"

/**
 * Factory used by `main.ts` and by tests — both assemble the service through
 * the exact same path. Required dependencies come in the typed `Deps` object
 * (compiler-enforced completeness); `options` are reserved for genuine
 * tunables declared as `with...` configurators next to this factory.
 */
export function createGreetingService(
  deps: GreetingServiceDeps,
  ...options: Configurator<GreetingService>[]
): GreetingService {
  return applyOptions(new GreetingService(deps), options)
}
