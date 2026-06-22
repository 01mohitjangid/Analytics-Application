import type { Collection } from "mongodb";
import { getDb } from "./mongodb";
import type { AnalyticsEvent } from "@/types/analytics";

const COLLECTION = "events";

let indexesEnsured: Promise<void> | null = null;

export async function getEventsCollection(): Promise<Collection<AnalyticsEvent>> {
  const db = await getDb();
  const collection = db.collection<AnalyticsEvent>(COLLECTION);

  if (!indexesEnsured) {
    indexesEnsured = collection
      .createIndexes([
        { key: { sessionId: 1, timestamp: 1 }, name: "session_timeline" },
        { key: { path: 1, type: 1 }, name: "page_clicks" },
      ])
      .then(() => undefined)
      .catch((err) => {
        indexesEnsured = null;
        throw err;
      });
  }
  await indexesEnsured;

  return collection;
}
