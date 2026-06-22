import type { AnalyticsEvent, EventType, TrackEventInput } from "@/types/analytics";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers ?? {}) },
  });
}

const EVENT_TYPES: readonly EventType[] = ["page_view", "click"];

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function parseEvent(
  raw: unknown,
  receivedAt: Date,
): { event: AnalyticsEvent } | { error: string } {
  if (typeof raw !== "object" || raw === null) {
    return { error: "Event must be an object" };
  }
  const input = raw as Partial<TrackEventInput>;

  if (typeof input.sessionId !== "string" || input.sessionId.trim() === "") {
    return { error: "sessionId is required" };
  }
  if (!EVENT_TYPES.includes(input.type as EventType)) {
    return { error: `type must be one of ${EVENT_TYPES.join(", ")}` };
  }
  if (typeof input.url !== "string" || input.url === "") {
    return { error: "url is required" };
  }

  let path = input.url;
  try {
    path = new URL(input.url).pathname;
  } catch {
    path = input.url;
  }

  const parsed = input.timestamp ? new Date(input.timestamp) : receivedAt;
  const timestamp = Number.isNaN(parsed.getTime()) ? receivedAt : parsed;

  const event: AnalyticsEvent = {
    sessionId: input.sessionId,
    type: input.type as EventType,
    url: input.url,
    path,
    timestamp,
    receivedAt,
  };

  if (input.type === "click") {
    if (!isFiniteNumber(input.x) || !isFiniteNumber(input.y)) {
      return { error: "click events require numeric x and y" };
    }
    event.x = input.x;
    event.y = input.y;
    if (isFiniteNumber(input.vw)) event.vw = input.vw;
  }

  return { event };
}
