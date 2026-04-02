// --- Objects ---

export type GreetingResult = {
  message: string
  clickCount: number
  timestamp: Date
}

// --- Port ---

export type ClickRepository = {
  getCount: () => Promise<number>
  increment: () => Promise<number>
}

// --- Methods (pure, testable) ---

export function formatGreeting(clickCount: number): string {
  if (clickCount === 1) return "Hello World! First click!"
  return `Hello World! Click #${clickCount}`
}

export function createGreetingResult(clickCount: number): GreetingResult {
  return {
    message: formatGreeting(clickCount),
    clickCount,
    timestamp: new Date(),
  }
}
