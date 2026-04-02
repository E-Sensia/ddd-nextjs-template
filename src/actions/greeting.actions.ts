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
