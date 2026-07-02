import { z } from "zod"
import type { GreetingResult } from "@domain/greeting"

// Mappers own shape validation at the edge: external data enters as
// `unknown` and is narrowed by a zod v4 schema (schema + inferred type in
// one place). Invalid shape -> null -> the action answers invalid_request
// and no service runs. Zod stays confined to src/mappers and config — the
// domain never imports a validation library.

// --- greet (outbound DTO) ---

export const greetResponseSchema = z.object({
  message: z.string(),
  clickCount: z.number().int().nonnegative(),
})

export type GreetResponse = z.infer<typeof greetResponseSchema>

export function toGreetResponse(result: GreetingResult): GreetResponse {
  return { message: result.message, clickCount: result.clickCount }
}

// --- trigger-error (inbound DTO) ---

const triggerErrorInputSchema = z.object({
  source: z.string().min(1),
})

export type TriggerErrorInput = z.infer<typeof triggerErrorInputSchema>

export function toTriggerErrorInput(raw: unknown): TriggerErrorInput | null {
  const parsed = triggerErrorInputSchema.safeParse(raw)
  if (!parsed.success) return null
  return parsed.data
}
