"use server"

import { getGreetingService } from "../../main"
import { GreetResponse, greetResponseSchema } from "./greeting.dto"

export async function greetAction(): Promise<GreetResponse> {
  const svc = getGreetingService()
  const result = await svc.greet()
  return greetResponseSchema.parse({
    message: result.message,
    clickCount: result.clickCount,
  })
}

export async function triggerErrorAction(): Promise<void> {
  const svc = getGreetingService()
  svc.logger.error("Test error triggered", { source: "debug-button" })
}
