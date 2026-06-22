import type { Collection } from "mongodb";
import { getDb } from "./mongodb";
import type { AnalyticsEvent } from "@/types/analytics";

const COLLECTION = "events";

let indexesEnsured: Promise<void> | null = null;

/**
 * Returns the typed `events` collection, ensuring the supporting indexes exist
 * exactly once per process. Index creation is idempotent in MongoDB, and we
 * memoize the promise so concurrent requests don't race to build them.
 */
export async function getEventsCollection(): Promise<Collection<AnalyticsEvent>> {
  const db = await getDb();
  const collection = db.collection<AnalyticsEvent>(COLLECTION);

  if (!indexesEnsured) {
    indexesEnsured = collection
      .createIndexes([
        // Sessions view: group by session, order by time.
        { key: { sessionId: 1, timestamp: 1 }, name: "session_timeline" },
        // Heatmap view: fetch clicks for a given page.
        { key: { path: 1, type: 1 }, name: "page_clicks" },
      ])
      .then(() => undefined)
      .catch((err) => {
        // Reset so a later request can retry rather than caching the failure.
        indexesEnsured = null;
        throw err;
      });
  }
  await indexesEnsured;

  return collection;
}
