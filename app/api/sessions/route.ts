import { getEventsCollection } from "@/lib/events";
import { json } from "@/lib/http";
import type { SessionSummary } from "@/types/analytics";

/**
 * Lists all sessions with event counts, most recently active first.
 * GET /api/sessions
 */
export async function GET() {
  try {
    const collection = await getEventsCollection();

    const rows = await collection
      .aggregate<{
        _id: string;
        eventCount: number;
        pageViews: number;
        clicks: number;
        firstSeen: Date;
        lastSeen: Date;
      }>([
        {
          $group: {
            _id: "$sessionId",
            eventCount: { $sum: 1 },
            pageViews: {
              $sum: { $cond: [{ $eq: ["$type", "page_view"] }, 1, 0] },
            },
            clicks: {
              $sum: { $cond: [{ $eq: ["$type", "click"] }, 1, 0] },
            },
            firstSeen: { $min: "$timestamp" },
            lastSeen: { $max: "$timestamp" },
          },
        },
        { $sort: { lastSeen: -1 } },
      ])
      .toArray();

    const sessions: SessionSummary[] = rows.map((r) => ({
      sessionId: r._id,
      eventCount: r.eventCount,
      pageViews: r.pageViews,
      clicks: r.clicks,
      firstSeen: r.firstSeen.toISOString(),
      lastSeen: r.lastSeen.toISOString(),
    }));

    return json({ sessions });
  } catch (err) {
    return json(
      {
        error: "Failed to fetch sessions",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
