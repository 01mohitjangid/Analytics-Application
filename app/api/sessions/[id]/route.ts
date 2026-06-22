import { getEventsCollection } from "@/lib/events";
import { json } from "@/lib/http";

/**
 * Returns all events for a session, ordered chronologically (the user journey).
 * GET /api/sessions/[id]
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/sessions/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const collection = await getEventsCollection();
    const docs = await collection
      .find({ sessionId: id }, { projection: { _id: 0 } })
      .sort({ timestamp: 1, receivedAt: 1 })
      .toArray();

    if (docs.length === 0) {
      return json({ error: "Session not found" }, { status: 404 });
    }

    const events = docs.map((d) => ({
      sessionId: d.sessionId,
      type: d.type,
      url: d.url,
      path: d.path,
      timestamp: d.timestamp.toISOString(),
      ...(d.type === "click" ? { x: d.x, y: d.y } : {}),
    }));

    return json({ sessionId: id, eventCount: events.length, events });
  } catch (err) {
    return json(
      {
        error: "Failed to fetch session",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
