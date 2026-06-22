"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClickPoint } from "@/types/analytics";

interface PageInfo {
  path: string;
  clicks: number;
}

/** Fallback width for clicks recorded before viewport width was captured. */
const DEFAULT_VW = 1280;

export default function HeatmapPage() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [selected, setSelected] = useState("");
  const [clicks, setClicks] = useState<ClickPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHeat, setShowHeat] = useState(true);

  const [containerW, setContainerW] = useState(0);
  const [stageH, setStageH] = useState(800);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Track the container width so we can scale the preview to fit.
  const wrapRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver(() => setContainerW(node.clientWidth));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Load the list of pages that have click data.
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/pages");
      const data = await res.json();
      if (res.ok && data.pages.length > 0) {
        setPages(data.pages);
        setSelected(data.pages[0].path);
      }
    })();
  }, []);

  // Load clicks whenever the selected page changes.
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/heatmap?path=${encodeURIComponent(selected)}`);
        const data = await res.json();
        if (!cancelled && res.ok) setClicks(data.clicks);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  // Render the page at the viewport width most clicks were captured at, so the
  // responsive layout matches and dots land on the right elements.
  const renderWidth = useMemo(() => {
    if (clicks.length === 0) return DEFAULT_VW;
    const counts = new Map<number, number>();
    for (const c of clicks) {
      const w = c.vw ?? DEFAULT_VW;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    let best = DEFAULT_VW;
    let bestN = -1;
    for (const [w, n] of counts) {
      if (n > bestN) {
        bestN = n;
        best = w;
      }
    }
    return best;
  }, [clicks]);

  // Only show clicks captured at the rendered width (others would be misplaced).
  const visibleClicks = useMemo(
    () => clicks.filter((c) => (c.vw ?? DEFAULT_VW) === renderWidth),
    [clicks, renderWidth],
  );

  const onIframeLoad = () => {
    try {
      const h = iframeRef.current?.contentDocument?.body?.scrollHeight;
      if (h) setStageH(h);
    } catch {
      /* same-origin expected; ignore if blocked */
    }
  };

  const maxClickY = visibleClicks.reduce((m, c) => Math.max(m, c.y), 0);
  const effectiveH = Math.max(stageH, maxClickY + 80, 600);
  const scale = containerW ? Math.min(1, containerW / renderWidth) : 1;
  const hiddenCount = clicks.length - visibleClicks.length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Heatmap</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Clicks overlaid on the live page (rendered at {renderWidth}px).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHeat((v) => !v)}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            {showHeat ? "Heat: on" : "Heat: off"}
          </button>
          <label className="text-sm text-zinc-400">Page</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={pages.length === 0}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"
          >
            {pages.length === 0 && <option>No pages with clicks</option>}
            {pages.map((p) => (
              <option key={p.path} value={p.path}>
                {p.path} ({p.clicks})
              </option>
            ))}
          </select>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
          <p className="text-zinc-400">No click data yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Open the{" "}
            <Link href="/" className="text-indigo-400 hover:underline">
              store
            </Link>{" "}
            and click around.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-zinc-400">
            {loading ? "Loading…" : `${visibleClicks.length} clicks on `}
            <span className="font-mono text-zinc-300">{selected}</span>
            {hiddenCount > 0 && (
              <span className="text-zinc-600">
                {" "}
                ({hiddenCount} at other widths hidden)
              </span>
            )}
          </p>

          <div
            ref={wrapRef}
            className="overflow-hidden rounded-xl border border-zinc-800 bg-white"
            style={{ height: effectiveH * scale }}
          >
            <div
              className="relative origin-top-left"
              style={{
                width: renderWidth,
                height: effectiveH,
                transform: `scale(${scale})`,
              }}
            >
              {/* Live page, rendered for visualization only (name disables tracking). */}
              <iframe
                ref={iframeRef}
                name="ua-no-track"
                title="page preview"
                src={selected}
                onLoad={onIframeLoad}
                sandbox="allow-same-origin allow-scripts"
                scrolling="no"
                className="pointer-events-none absolute inset-0 border-0"
                style={{ width: renderWidth, height: effectiveH }}
              />

              {/* Click overlay */}
              <div className="pointer-events-none absolute inset-0">
                {visibleClicks.map((c, i) => (
                  <span key={i}>
                    {showHeat && (
                      <span
                        className="absolute rounded-full"
                        style={{
                          left: c.x - 40,
                          top: c.y - 40,
                          width: 80,
                          height: 80,
                          background:
                            "radial-gradient(circle, rgba(244,63,94,0.55) 0%, rgba(244,63,94,0) 70%)",
                        }}
                      />
                    )}
                    <span
                      className="absolute rounded-full bg-rose-600 ring-2 ring-white/70"
                      style={{ left: c.x - 3, top: c.y - 3, width: 6, height: 6 }}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
