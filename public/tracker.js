/**
 * User Analytics tracker — vanilla, dependency-free.
 *
 * Add to any page:
 *   <script src="/tracker.js" data-endpoint="/api/events"></script>
 *
 * Config (optional), via the <script> tag's data attributes:
 *   data-endpoint   Full URL to the events API. Default: same-origin /api/events
 *   data-api-base   Base origin to prefix /api/events with (used if no endpoint)
 *
 * Tracks `page_view` on load and `click` anywhere on the document. Events are
 * queued and flushed in batches; the queue is flushed reliably on page hide via
 * navigator.sendBeacon.
 */
(function () {
  "use strict";

  // Opt-out: when embedded in the dashboard heatmap preview, the iframe is
  // named "ua-no-track" so this page is rendered for visualization only and
  // must not record events.
  if (typeof window !== "undefined" && window.name === "ua-no-track") return;

  var SESSION_KEY = "ua_session_id";
  var FLUSH_INTERVAL_MS = 3000;
  var MAX_QUEUE = 20;

  // --- Resolve config from the script tag ---------------------------------
  var script = document.currentScript;
  var ds = (script && script.dataset) || {};
  var endpoint =
    ds.endpoint ||
    (ds.apiBase ? ds.apiBase.replace(/\/$/, "") + "/api/events" : "/api/events");

  // --- Session id (persisted in localStorage, cookie fallback) ------------
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getSessionId() {
    try {
      var id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = uuid();
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      // localStorage blocked — fall back to a cookie.
      var m = document.cookie.match(/(?:^|;\s*)ua_session_id=([^;]+)/);
      if (m) return decodeURIComponent(m[1]);
      var fresh = uuid();
      document.cookie =
        SESSION_KEY + "=" + encodeURIComponent(fresh) + ";path=/;max-age=31536000";
      return fresh;
    }
  }

  var sessionId = getSessionId();

  // --- Event queue + flushing ---------------------------------------------
  var queue = [];

  function enqueue(event) {
    queue.push(event);
    if (queue.length >= MAX_QUEUE) flush(false);
  }

  function flush(useBeacon) {
    if (queue.length === 0) return;
    var batch = queue.splice(0, queue.length);
    var payload = JSON.stringify({ events: batch });

    // On unload, sendBeacon is the only reliable transport. Use a text/plain
    // Blob so it stays a CORS-safelisted request (no blocked preflight); the
    // API parses the body as JSON regardless of content-type.
    if (useBeacon && navigator.sendBeacon) {
      var ok = navigator.sendBeacon(
        endpoint,
        new Blob([payload], { type: "text/plain;charset=UTF-8" })
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
    }).catch(function () {
      // Network error — re-queue so the next flush retries.
      queue = batch.concat(queue);
    });
  }

  function track(type, extra) {
    var event = {
      sessionId: sessionId,
      type: type,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
    if (extra) for (var k in extra) event[k] = extra[k];
    enqueue(event);
  }

  // --- Wire up listeners ---------------------------------------------------
  track("page_view");

  document.addEventListener(
    "click",
    function (e) {
      // pageX/pageY are document-relative (include scroll) so the heatmap can
      // render against the full page, not just the current viewport. We also
      // record the layout viewport width (`vw`) so the heatmap can re-render
      // the page at the exact width the click happened at — otherwise a
      // responsive layout reflows and the dots no longer line up.
      track("click", {
        x: Math.round(e.pageX),
        y: Math.round(e.pageY),
        vw: window.innerWidth || document.documentElement.clientWidth,
      });
    },
    true
  );

  setInterval(function () {
    flush(false);
  }, FLUSH_INTERVAL_MS);

  // Flush reliably when the page is being hidden/closed.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", function () {
    flush(true);
  });

  // Expose a tiny API for manual/custom tracking and debugging.
  window.uaTracker = { track: track, flush: flush, sessionId: sessionId };
})();
