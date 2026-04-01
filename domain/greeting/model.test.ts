import { formatGreeting, createGreetingResult } from "./model"

describe("formatGreeting", () => {
  it("returns first click message for count 1", () => {
    expect(formatGreeting(1)).toBe("Hello World! First click!")
  })

  it("returns numbered message for subsequent clicks", () => {
    expect(formatGreeting(2)).toBe("Hello World! Click #2")
    expect(formatGreeting(100)).toBe("Hello World! Click #100")
  })
})

describe("createGreetingResult", () => {
  it("creates a result with the correct message and count", () => {
    const result = createGreetingResult(3)
    expect(result.message).toBe("Hello World! Click #3")
    expect(result.clickCount).toBe(3)
    expect(result.timestamp).toBeInstanceOf(Date)
  })
})
