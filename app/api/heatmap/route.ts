import { getEventsCollection } from "@/lib/events";
import { json } from "@/lib/http";
import type { ClickPoint } from "@/types/analytics";

const MAX_POINTS = 5000;

/**
 * Returns click coordinates for a given page path, for heatmap rendering.
 * GET /api/heatmap?path=/demo
 */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path");
  if (!path) {
    return json({ error: "Missing required query param: path" }, { status: 400 });
  }

  try {
    const collection = await getEventsCollection();
    const docs = await collection
      .find(
        { path, type: "click", x: { $exists: true }, y: { $exists: true } },
        { projection: { _id: 0, x: 1, y: 1, vw: 1, timestamp: 1 } },
      )
      .limit(MAX_POINTS)
      .toArray();

    const clicks: ClickPoint[] = docs.map((d) => ({
      x: d.x as number,
      y: d.y as number,
      vw: d.vw,
      timestamp: d.timestamp.toISOString(),
    }));

    return json({ path, count: clicks.length, clicks });
  } catch (err) {
    return json(
      {
        error: "Failed to fetch heatmap data",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
