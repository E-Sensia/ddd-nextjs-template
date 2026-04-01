// --- Objects ---

export type GreetingResult = {
  message: string
  clickCount: number
  timestamp: Date
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
