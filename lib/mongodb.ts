import { MongoClient, type Db } from "mongodb";

/**
 * Cached MongoDB connection.
 *
 * In development, Next.js clears the module cache on every hot-reload, which
 * would otherwise open a brand-new connection pool on each change and quickly
 * exhaust the database. We stash the client promise on `globalThis` so a single
 * pool is reused across reloads. In production the module is evaluated once, so
 * a plain module-scoped promise is enough.
 */

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "user_analytics";

if (!uri) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Copy .env.example to .env.local and set it.",
  );
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? new MongoClient(uri).connect();

if (process.env.NODE_ENV !== "production") {
  global._mongoClientPromise = clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;
