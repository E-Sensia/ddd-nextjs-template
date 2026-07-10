import { headers } from "next/headers"
import type { NextRequest } from "next/server"
import { runWithLogContext } from "@domain/logging"
import {
  asRequestId,
  createConversationId,
  type ConversationId,
} from "@domain/shared"

const CONVERSATION_ID_HEADER = "X-Conversation-Id"

export type RouteHandler = (
  request: NextRequest,
) => Response | Promise<Response>

function toConversationId(raw: string | null): ConversationId | undefined {
  if (!raw) return undefined
  // A missing or malformed header is a signal — the id is omitted from the
  // logs, never re-invented downstream of the telephony edge.
  return createConversationId(raw) ?? undefined
}

/**
 * Wraps a server-action body: reads the incoming X-Conversation-Id header,
 * mints a per-request request_id, and runs the body inside the logging
 * context so every log line of the action carries both.
 */
export async function withConversationContext<T>(
  fn: () => Promise<T>,
): Promise<T> {
  const incoming = await headers()
  return runWithLogContext(
    {
      conversationId: toConversationId(incoming.get(CONVERSATION_ID_HEADER)),
      requestId: asRequestId(crypto.randomUUID()),
    },
    fn,
  )
}

/** Same contract for route handlers, reading headers from the request. */
export function withRequestContext(handler: RouteHandler): RouteHandler {
  return (request) =>
    runWithLogContext(
      {
        conversationId: toConversationId(
          request.headers.get(CONVERSATION_ID_HEADER),
        ),
        requestId: asRequestId(crypto.randomUUID()),
      },
      () => handler(request),
    )
}
