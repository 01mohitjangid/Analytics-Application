/**
 * Shared analytics types — the single source of truth for the event shape
 * used by the tracking script, the API route handlers, and the dashboard.
 */

export type EventType = "page_view" | "click";

/** Payload sent by the client tracking script to the ingestion API. */
export interface TrackEventInput {
  sessionId: string;
  type: EventType;
  /** Full page URL at the time of the event (location.href). */
  url: string;
  /** ISO-8601 timestamp generated on the client. */
  timestamp: string;
  /** Click coordinates relative to the document — present only for `click`. */
  x?: number;
  y?: number;
}

/** An event document as stored in MongoDB. */
export interface AnalyticsEvent {
  sessionId: string;
  type: EventType;
  url: string;
  /** Normalized path (pathname) for grouping clicks per page in the heatmap. */
  path: string;
  /** Client-reported event time. */
  timestamp: Date;
  x?: number;
  y?: number;
  /** Server receive time — authoritative ordering fallback. */
  receivedAt: Date;
}

/** A session summary row for the Sessions view. */
export interface SessionSummary {
  sessionId: string;
  eventCount: number;
  pageViews: number;
  clicks: number;
  firstSeen: string;
  lastSeen: string;
}

/** A single click point for the heatmap view. */
export interface ClickPoint {
  x: number;
  y: number;
  timestamp: string;
}
