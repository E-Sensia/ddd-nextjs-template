// Branded identifier types: distinct at compile time, plain strings at
// runtime, so ids can never be swapped in a signature ("make illegal states
// unrepresentable"). `asXxxId` casts a value we already trust (generated
// here, or read from a validated source); smart constructors validate
// untrusted input and return null instead of building an invalid object.

// --- Conversation id (business correlation id, see log-format doctrine) ---

export type ConversationId = string & { readonly __brand: "ConversationId" }
export const asConversationId = (raw: string): ConversationId =>
  raw as ConversationId

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Smart constructor for untrusted input (e.g. the X-Conversation-Id header):
 * the conversation id is a UUID minted once at the telephony edge. Anything
 * else is rejected — a downstream service never invents or repairs one.
 */
export function createConversationId(raw: string): ConversationId | null {
  return UUID_PATTERN.test(raw) ? (raw as ConversationId) : null
}

// --- Request id (per-request technical correlation, minted at each edge) ---

export type RequestId = string & { readonly __brand: "RequestId" }
export const asRequestId = (raw: string): RequestId => raw as RequestId

// --- OTEL trace correlation ---

export type TraceId = string & { readonly __brand: "TraceId" }
export const asTraceId = (raw: string): TraceId => raw as TraceId

export type SpanId = string & { readonly __brand: "SpanId" }
export const asSpanId = (raw: string): SpanId => raw as SpanId
