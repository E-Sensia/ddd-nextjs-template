import { ClickRepository } from "../model"

export function createInMemoryClickRepository(): ClickRepository {
  let count = 0

  return {
    getCount: async () => count,
    increment: async () => ++count,
  }
}
