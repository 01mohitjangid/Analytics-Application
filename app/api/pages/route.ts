import { getEventsCollection } from "@/lib/events";
import { json } from "@/lib/http";

export async function GET() {
  try {
    const collection = await getEventsCollection();
    const rows = await collection
      .aggregate<{ _id: string; clicks: number }>([
        { $match: { type: "click" } },
        { $group: { _id: "$path", clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
      ])
      .toArray();

    const pages = rows.map((r) => ({ path: r._id, clicks: r.clicks }));
    return json({ pages });
  } catch (err) {
    return json(
      {
        error: "Failed to fetch pages",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
