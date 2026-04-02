export {
  type GreetingResult,
  type ClickRepository,
  formatGreeting,
  createGreetingResult,
} from "./model"
export { createInMemoryClickRepository } from "./memory/implementation"
export { createClickRepositoryStub } from "./stub/implementation"
