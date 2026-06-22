

interface UaTrackerApi {
  track: (type: string, extra?: Record<string, number>) => void;
  flush: (useBeacon?: boolean) => void;
  sessionId: string;
}

type QueuedEvent = Record<string, string | number>;

(function () {
  "use strict";

  if (typeof window !== "undefined" && window.name === "ua-no-track") return;

  const SESSION_KEY = "ua_session_id";
  const FLUSH_INTERVAL_MS = 3000;
  const MAX_QUEUE = 20;

  const script = document.currentScript as HTMLScriptElement | null;
  const ds: DOMStringMap = script?.dataset ?? {};
  const endpoint =
    ds.endpoint ??
    (ds.apiBase ? ds.apiBase.replace(/\/$/, "") + "/api/events" : "/api/events");

  function uuid(): string {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getSessionId(): string {
    try {
      let id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = uuid();
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      const m = document.cookie.match(/(?:^|;\s*)ua_session_id=([^;]+)/);
      if (m) return decodeURIComponent(m[1]);
      const fresh = uuid();
      document.cookie =
        SESSION_KEY + "=" + encodeURIComponent(fresh) + ";path=/;max-age=31536000";
      return fresh;
    }
  }

  const sessionId = getSessionId();

  let queue: QueuedEvent[] = [];

  function enqueue(event: QueuedEvent): void {
    queue.push(event);
    if (queue.length >= MAX_QUEUE) flush(false);
  }

  function flush(useBeacon = false): void {
    if (queue.length === 0) return;
    const batch = queue.splice(0, queue.length);
    const payload = JSON.stringify({ events: batch });

    if (useBeacon && navigator.sendBeacon) {
      const ok = navigator.sendBeacon(
        endpoint,
        new Blob([payload], { type: "text/plain;charset=UTF-8" }),
      );
      if (ok) return;
      queue = batch.concat(queue); // re-queue on failure
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      queue = batch.concat(queue);
    });
  }

  function track(type: string, extra?: Record<string, number>): void {
    const event: QueuedEvent = {
      sessionId,
      type,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...extra,
    };
    enqueue(event);
  }

  track("page_view");

  document.addEventListener(
    "click",
    (e: MouseEvent) => {
      track("click", {
        x: Math.round(e.pageX),
        y: Math.round(e.pageY),
        vw: window.innerWidth || document.documentElement.clientWidth,
      });
    },
    true,
  );

  setInterval(() => flush(false), FLUSH_INTERVAL_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", () => flush(true));

  const api: UaTrackerApi = { track, flush, sessionId };
  (window as unknown as { uaTracker?: UaTrackerApi }).uaTracker = api;
})();

export {};
