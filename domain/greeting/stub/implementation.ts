import type { ClickRepository } from "../model"

export function createClickRepositoryStub(
  initialCount = 0,
): ClickRepository & { count: number } {
  let count = initialCount

  return {
    get count() {
      return count
    },
    getCount: async () => count,
    increment: async () => ++count,
  }
}
