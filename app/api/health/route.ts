import { getDb } from "@/lib/mongodb";

/** Liveness + DB connectivity check: GET /api/health */
export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return Response.json({ status: "ok", db: "connected" });
  } catch (err) {
    return Response.json(
      {
        status: "error",
        db: "unreachable",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
