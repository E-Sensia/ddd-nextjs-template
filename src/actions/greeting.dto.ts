import { z } from "zod"

export const greetResponseSchema = z.object({
  message: z.string(),
  clickCount: z.number().int().nonnegative(),
})

export type GreetResponse = z.infer<typeof greetResponseSchema>
