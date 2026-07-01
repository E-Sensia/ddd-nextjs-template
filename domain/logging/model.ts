import type { ConversationId, RequestId } from "../shared/types"

// --- Objects ---

export type LogLevel = "debug" | "info" | "warn" | "error"

export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
}

export function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  return { level, message, timestamp: new Date(), context }
}

/**
 * Correlation fields stamped on every log line of a unit of work.
 * conversation_id is the business correlation id of a call — minted once at
 * the telephony edge, propagated via the X-Conversation-Id header, never
 * invented downstream. request_id is minted at each service edge.
 */
export type LogContext = {
  conversationId?: ConversationId
  requestId?: RequestId
}

// --- Port ---

export type Logger = {
  debug: (message: string, context?: Record<string, unknown>) => void
  info: (message: string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, context?: Record<string, unknown>) => void
}
