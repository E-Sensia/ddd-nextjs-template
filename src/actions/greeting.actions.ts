"use server"

import { getGreetingService } from "../../main"

export async function greetAction(): Promise<{
  message: string
  clickCount: number
}> {
  const svc = getGreetingService()
  const result = await svc.greet()
  return {
    message: result.message,
    clickCount: result.clickCount,
  }
}
