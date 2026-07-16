---
title: Log Format
type: concept
domain: tech
lang: en
tags: [logging, observability]
status: stable
created: 2026-06-24
updated: 2026-07-02
aliases: [logging standard, conversation id]
kb_source: tech/concepts/log-format.md
kb_sha: 40cd8fcc1429bcdfcf4100af4330391e872a2c9c
---

# Log Format

## What & why

One log format for **all** services, whatever the language: structured JSON in production (one object per line on stdout, shipped to Loki/CloudWatch), pretty console output in development. A log line from any service must be readable, greppable and joinable with every other service's lines — the join key is the **conversation id**.

Logging is always a **port** injected into services ([[ddd#Observability]]); this note defines what its implementations emit.

## Canonical fields

| Field | Content | Rule |
|---|---|---|
| `timestamp` | RFC 3339 UTC with milliseconds | always |
| `level` | `debug` \| `info` \| `warn` \| `error` | always |
| `service` | service name (e.g. `inferengine`) | always |
| `version` | service version | always |
| `message` | **stable constant string**, lowercase, imperative (`"inference completed"`) | always — data never interpolated into it |
| `conversation_id` | business correlation id (see below) | on every line of call-scoped work |
| `request_id` | per HTTP/gRPC request, generated at each service edge | on request-scoped lines |
| `trace_id` / `span_id` | OTEL correlation | when a span is active |
| *extra fields* | flat key/value context (`user_id`, `model`, `duration_ms`…) | allowlisted — **never PII, medical data or secrets** ([[ddd#Security]]) |

The `message` rule is what makes logs searchable: `"inference completed"` with `{"model": "whisperx", "duration_ms": 812}` can be counted, filtered and graphed in Loki; `"inference of whisperx completed in 812ms"` cannot.

**Production (JSON):**

```json
{"timestamp":"2026-07-02T14:31:22.418Z","level":"info","service":"inferengine","version":"1.4.2","message":"inference completed","conversation_id":"c1b2a3d4-...","request_id":"9f3a-...","trace_id":"4bf9...","model":"whisperx","duration_ms":812}
```

**Development (console, `LOG_FORMAT=console`):**

```
14:31:22.418 INFO  inference completed  conversation_id=c1b2a3d4 model=whisperx duration_ms=812
```

## The conversation id

`conversation_id` is **the business correlation id of an emergency call**: generated **once**, at the telephony edge, the moment a call is received. It follows the call through every service, for the call's whole lifetime (minutes), across HTTP, gRPC and queues.

Rules:

- **Only the call-reception edge generates it** (UUID v4). A downstream service never invents one — a missing id is a signal, not something to patch over.
- **Propagation is explicit**: HTTP header `X-Conversation-Id`, gRPC metadata `conversation-id`, message attribute `conversation_id`. The shared HTTP/gRPC clients in `utils/` forward it automatically on outbound calls.
- **At each service edge, middleware reads the header and pushes it into the logging context** (contextvars in Python, `ctx` in Go, AsyncLocalStorage in Node) — every log line of that unit of work carries it without threading it through signatures ([[ddd#Observability]]).
- Also set it as an OTEL span attribute (`conversation.id`) so traces are queryable by conversation.
- `conversation_id` ≠ `trace_id`: the trace is technical, per request chain, and may be sampled; the conversation is business, spans the entire call, and is **never sampled**.
- Endpoints outside a call's scope (health, ready, admin) simply omit the field.

## Levels doctrine

- `debug` — diagnosis detail, off in production by default.
- `info` — one line per meaningful business step (call received, transcription done, regulation decision). This is the narrative of the call.
- `warn` — degraded but handled: fallback used, retry succeeded, provider failed over.
- `error` — unexpected, needs attention. Paired with the **handle-once** rule ([[ddd#Error handling]]): an error is logged where it is handled, never at every level it passes through.

## Per-stack implementation

The `Logger` port stays the same; only the implementation changes — see each convention page:

- **Go** ([[ddd-in-go]]): `zap` + `otelzap`; middleware puts `conversation_id` into the request context; the logger implementation stamps context fields on every line.
- **Python** ([[ddd-in-python]]): stdlib `logging` + `python-json-logger`; middleware `push_context(conversation_id=...)` via contextvars.
- **TypeScript** ([[ddd-in-typescript]]): logger port implementation over AsyncLocalStorage; Server Actions read the incoming `X-Conversation-Id` header.

## Pitfalls

- Values interpolated into `message` — kills searchability.
- A downstream service generating a fresh conversation id when the header is missing — silently forks the correlation.
- PII, medical content or secrets in extra fields — forbidden ([[ddd#Security]]); log identifiers, never content.
- Logging *and* rethrowing the same error at every layer.
- A logger singleton instead of the injected port.

## Related

- [[ddd]] — Observability and Security sections
- [[error-handling]] — what gets logged where
- [[ddd-in-go]], [[ddd-in-python]], [[ddd-in-typescript]] — implementations

*Defined 2026-07-02 — conversation_id doctrine standardized across all services.*
