"use server"

import { getGreetingService, getLogger } from "../../main"
import { type ActionResult, toActionError } from "../mappers/errors.mapper"
import {
  type GreetResponse,
  toGreetResponse,
  toTriggerErrorInput,
} from "../mappers/greeting.mapper"
import { withConversationContext } from "../server/request-context"

export async function greetAction(): Promise<ActionResult<GreetResponse>> {
  return withConversationContext(async () => {
    try {
      const result = await getGreetingService().greet()
      return { ok: true, data: toGreetResponse(result) }
    } catch (err) {
      return toActionError(err, getLogger())
    }
  })
}

export async function triggerErrorAction(
  raw: unknown,
): Promise<ActionResult<null>> {
  return withConversationContext(async () => {
    const input = toTriggerErrorInput(raw)
    if (!input) return { ok: false, error: "INVALID_REQUEST" }

    getLogger().error("test error triggered", { source: input.source })
    return { ok: true, data: null }
  })
}
