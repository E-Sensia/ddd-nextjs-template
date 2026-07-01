import { createAsyncContext } from "@utils"
import type { LogContext } from "./model"

const context = createAsyncContext<LogContext>()

/**
 * The server edge reads the incoming X-Conversation-Id header, mints a
 * request id, and runs the unit of work inside this context. Logger
 * implementations stamp the fields on every line without the ids being
 * threaded through signatures (AsyncLocalStorage under the hood).
 */
export const runWithLogContext = context.run
export const getLogContext = context.get
