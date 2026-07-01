import type { Logger } from "@domain/logging"

/**
 * Server actions never throw across the wire (Next.js hides server error
 * messages in production, so a thrown error reaches the client as an opaque
 * failure). They return this discriminated union instead, and the error
 * branch carries a stable code — never an internal message.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/**
 * The single error -> transport translation. Typed expected errors from
 * services map to their stable codes here, e.g.:
 *
 *   if (err instanceof OrderNotFoundError) return { ok: false, error: err.code }
 *
 * Anything unknown is logged once (handle-once rule) and becomes "INTERNAL".
 */
export function toActionError(
  err: unknown,
  logger: Logger,
): ActionResult<never> {
  logger.error("unexpected error", {
    error: err instanceof Error ? err.message : String(err),
  })
  return { ok: false, error: "INTERNAL" }
}
