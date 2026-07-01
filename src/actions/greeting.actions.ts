"use server"

import { getGreetingService, getLogger } from "../../main"
import { type GreetResponse, greetResponseSchema } from "./greeting.dto"
import { type ActionResult, toActionError } from "../mappers/errors.mapper"

export async function greetAction(): Promise<ActionResult<GreetResponse>> {
  try {
    const svc = getGreetingService()
    const result = await svc.greet()
    const data = greetResponseSchema.parse({
      message: result.message,
      clickCount: result.clickCount,
    })
    return { ok: true, data }
  } catch (err) {
    return toActionError(err, getLogger())
  }
}

export async function triggerErrorAction(): Promise<void> {
  getLogger().error("Test error triggered", { source: "debug-button" })
}
