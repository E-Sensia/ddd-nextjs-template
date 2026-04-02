"use server"

import { getGreetingService } from "../../main"
import { GreetResponse, greetResponseSchema } from "./greeting.dto"
import { ActionResult } from "@utils"

export async function greetAction(): Promise<ActionResult<GreetResponse>> {
  try {
    const svc = getGreetingService()
    const result = await svc.greet()
    const data = greetResponseSchema.parse({
      message: result.message,
      clickCount: result.clickCount,
    })
    return { success: true, data }
  } catch (err) {
    const svc = getGreetingService()
    svc.logger.error("greetAction failed", {
      error: err instanceof Error ? err.message : String(err),
    })
    return { success: false, error: "Failed to process greeting" }
  }
}

export async function triggerErrorAction(): Promise<void> {
  const svc = getGreetingService()
  svc.logger.error("Test error triggered", { source: "debug-button" })
}
