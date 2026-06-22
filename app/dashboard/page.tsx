"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { SessionSummary } from "@/types/analytics";

interface JourneyEvent {
  type: "page_view" | "click";
  url: string;
  path: string;
  timestamp: string;
  x?: number;
  y?: number;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function shortId(id: string) {
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [journey, setJourney] = useState<JourneyEvent[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load sessions");
        if (!cancelled) setSessions(data.sessions);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSession = useCallback(async (id: string) => {
    setSelected(id);
    setJourneyLoading(true);
    setJourney([]);
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (res.ok) setJourney(data.events);
    } finally {
      setJourneyLoading(false);
    }
  }, []);

  const totals = sessions.reduce(
    (acc, s) => {
      acc.events += s.eventCount;
      acc.views += s.pageViews;
      acc.clicks += s.clicks;
      return acc;
    },
    { events: 0, views: 0, clicks: 0 },
  );

  const stats = [
    { label: "Sessions", value: sessions.length },
    { label: "Total events", value: totals.events },
    { label: "Page views", value: totals.views },
    { label: "Clicks", value: totals.clicks },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {loading ? "Loading…" : `${sessions.length} session${sessions.length === 1 ? "" : "s"} tracked`}
        </p>
      </div>

      {!loading && !error && sessions.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
          <p className="text-zinc-400">No sessions yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Open the{" "}
            <Link href="/" className="text-indigo-400 hover:underline">
              store
            </Link>{" "}
            and click around to generate events.
          </p>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/60 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Events</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Clicks</th>
                <th className="px-4 py-3 font-medium">Last seen</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sessions.map((s) => (
                <tr key={s.sessionId} className="hover:bg-zinc-900/40">
                  <td className="px-4 py-3 font-mono text-zinc-300">{shortId(s.sessionId)}</td>
                  <td className="px-4 py-3 font-medium">{s.eventCount}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.pageViews}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.clicks}</td>
                  <td className="px-4 py-3 text-zinc-400">{fmtTime(s.lastSeen)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openSession(s.sessionId)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                    >
                      View journey
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Journey drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-30 flex justify-end bg-black/60"
          onClick={() => setSelected(null)}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">User journey</h2>
                <p className="font-mono text-xs text-zinc-500">{selected}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {journeyLoading ? (
              <p className="text-sm text-zinc-400">Loading…</p>
            ) : (
              <ol className="relative border-l border-zinc-800 pl-6">
                {journey.map((ev, i) => (
                  <li key={i} className="mb-5">
                    <span
                      className={`absolute left-[-7px] mt-1 h-3 w-3 rounded-full ${
                        ev.type === "page_view" ? "bg-emerald-400" : "bg-indigo-400"
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {ev.type === "page_view" ? "Page view" : "Click"}
                      </span>
                      {ev.type === "click" && (
                        <span className="font-mono text-xs text-zinc-500">
                          ({ev.x}, {ev.y})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400">{ev.path}</div>
                    <div className="text-xs text-zinc-600">{fmtTime(ev.timestamp)}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
