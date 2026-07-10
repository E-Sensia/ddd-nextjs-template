import { describe, expect, it } from "vitest"
import {
  asConversationId,
  asRequestId,
  asSpanId,
  asTraceId,
  createConversationId,
} from "./types"

describe("branded id casts", () => {
  it("preserve the raw string value", () => {
    expect(asConversationId("c-1")).toBe("c-1")
    expect(asRequestId("r-1")).toBe("r-1")
    expect(asTraceId("t-1")).toBe("t-1")
    expect(asSpanId("s-1")).toBe("s-1")
  })
})

describe("createConversationId", () => {
  it("accepts a canonical UUID", () => {
    const id = createConversationId("c1b2a3d4-e5f6-4abc-8def-123456789abc")
    expect(id).toBe("c1b2a3d4-e5f6-4abc-8def-123456789abc")
  })

  it("accepts uppercase UUIDs", () => {
    const id = createConversationId("C1B2A3D4-E5F6-4ABC-8DEF-123456789ABC")
    expect(id).not.toBeNull()
  })

  it("rejects non-UUID input", () => {
    expect(createConversationId("not-a-uuid")).toBeNull()
    expect(createConversationId("")).toBeNull()
    expect(createConversationId("c1b2a3d4")).toBeNull()
    expect(
      createConversationId("c1b2a3d4-e5f6-4abc-8def-123456789abcd"),
    ).toBeNull()
  })
})
