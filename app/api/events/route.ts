import { getEventsCollection } from "@/lib/events";
import { CORS_HEADERS, json, parseEvent } from "@/lib/http";
import type { AnalyticsEvent } from "@/types/analytics";

const MAX_BATCH = 100;

/** CORS preflight for cross-origin tracking. */
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Ingests one event or a batch.
 * Body: a single event object, or `{ events: [...] }`, or a raw array.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Accept { events: [...] }, a bare array, or a single event object.
  const rawEvents: unknown[] = Array.isArray(body)
    ? body
    : Array.isArray((body as { events?: unknown[] })?.events)
      ? (body as { events: unknown[] }).events
      : [body];

  if (rawEvents.length === 0) {
    return json({ error: "No events provided" }, { status: 400 });
  }
  if (rawEvents.length > MAX_BATCH) {
    return json(
      { error: `Batch too large (max ${MAX_BATCH})` },
      { status: 413 },
    );
  }

  const receivedAt = new Date();
  const docs: AnalyticsEvent[] = [];
  for (let i = 0; i < rawEvents.length; i++) {
    const result = parseEvent(rawEvents[i], receivedAt);
    if ("error" in result) {
      return json(
        { error: `Event ${i}: ${result.error}` },
        { status: 400 },
      );
    }
    docs.push(result.event);
  }

  try {
    const collection = await getEventsCollection();
    await collection.insertMany(docs);
  } catch (err) {
    return json(
      {
        error: "Failed to store events",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }

  return json({ inserted: docs.length }, { status: 201 });
}
