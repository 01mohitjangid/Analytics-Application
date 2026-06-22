# User Analytics Application

A small full-stack app that tracks user interactions (`page_view`, `click`) on a
webpage and visualizes them in a dashboard — sessions (user journeys) and a
click heatmap per page.

## Tech stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------- |
| Frontend     | Next.js 16 (App Router) + React 19 + Tailwind CSS v4          |
| Backend      | Next.js Route Handlers (`app/api/*`) — Node.js runtime        |
| Database     | MongoDB (official `mongodb` driver)                           |
| Tracking     | Vanilla JS script (`public/tracker.js`), no dependencies      |
| Language     | TypeScript                                                    |

### Why one Next.js app instead of a separate backend?

The assignment allows Node.js for the backend and React/Next.js for the
dashboard. Using Next.js Route Handlers as the backend keeps everything in a
single deployable (one repo, one deploy target, shared TypeScript types between
client and server) while still being plain server-side Node.js. The trade-off:
the API is coupled to the Next.js server rather than independently scalable —
acceptable at this scope.

## Prerequisites

- Node.js 20+
- pnpm
- A MongoDB instance (local `mongod`, Docker, or MongoDB Atlas)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
# then edit .env.local and set MONGODB_URI

# 3. (local Mongo via Docker, optional)
docker run -d -p 27017:27017 --name analytics-mongo mongo:7

# 4. Run the dev server
pnpm dev
```

Verify the database connection:

```bash
curl http://localhost:3000/api/health
# { "status": "ok", "db": "connected" }
```

## Environment variables

| Variable               | Required | Description                                        |
| ---------------------- | -------- | -------------------------------------------------- |
| `MONGODB_URI`          | yes      | MongoDB connection string                          |
| `MONGODB_DB`           | no       | Database name (default `user_analytics`)           |
| `NEXT_PUBLIC_API_BASE` | no       | Base URL for the tracker; empty = same-origin      |

## Project structure

```
app/
  (store)/             # Storefront route group (the tracked site)
    layout.tsx         # Loads the tracker + footer; light theme
    page.tsx           # Homepage (hero + product grid)
    product/[id]/      # Product detail page
  dashboard/           # Analytics dashboard (not tracked); dark theme
    layout.tsx         # Dashboard nav shell
    page.tsx           # Sessions view (+ journey drawer)
    heatmap/page.tsx   # Heatmap view (canvas)
  api/                 # Backend route handlers (the API)
    events/route.ts    # POST ingest (single or batch) + CORS
    sessions/route.ts  # GET sessions list with counts
    sessions/[id]/     # GET ordered events for a session
    heatmap/route.ts   # GET click points for a page
    pages/route.ts     # GET distinct pages with click counts
    health/route.ts    # DB connectivity check
  components/          # Nav, StoreHeader/Footer, ProductCard, Tracker, ...
lib/
  mongodb.ts           # Cached MongoDB connection (hot-reload safe)
  events.ts            # Typed `events` collection + index setup
  http.ts              # JSON/CORS helpers + event validation
  products.ts          # Demo store product catalog
types/
  analytics.ts         # Shared event/session/click types
public/
  tracker.js           # Client-side tracking script
```

## Data model

Events are stored in a single `events` collection:

| Field        | Type            | Notes                                         |
| ------------ | --------------- | --------------------------------------------- |
| `sessionId`  | string          | From client cookie/localStorage               |
| `type`       | `page_view` \| `click` |                                        |
| `url`        | string          | Full `location.href`                          |
| `path`       | string          | `location.pathname` — grouping key for heatmap|
| `timestamp`  | Date            | Client-reported event time                    |
| `x`, `y`     | number          | Click coordinates (click events only)         |
| `receivedAt` | Date            | Server receive time                           |

Indexes: `{ sessionId, timestamp }` (session timelines) and `{ path, type }`
(per-page heatmap clicks).

## API

All endpoints live under `app/api`. The ingestion endpoint allows cross-origin
requests (CORS) so the tracker can be embedded on any site.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/events` | Ingest one event or a batch (`{events:[...]}`, a bare array, or a single object; max 100). Returns `{inserted}`. |
| `GET`  | `/api/sessions` | All sessions with `eventCount`, `pageViews`, `clicks`, `firstSeen`, `lastSeen`, newest first. |
| `GET`  | `/api/sessions/[id]` | Ordered event list (the user journey) for one session. `404` if unknown. |
| `GET`  | `/api/heatmap?path=<path>` | Click coordinates (`{x,y,timestamp}`) for a page path. |
| `GET`  | `/api/pages` | Distinct page paths that have clicks, with counts (powers the heatmap selector). |
| `GET`  | `/api/health` | DB connectivity check. |

Example ingest:

```bash
curl -X POST http://localhost:3000/api/events \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"abc","type":"click","url":"http://x/p","timestamp":"2026-01-01T00:00:00Z","x":10,"y":20}'
```

## Tracking script

Add to any page:

```html
<script src="/tracker.js" data-endpoint="/api/events"></script>
```

It generates a `session_id` (localStorage, cookie fallback), tracks `page_view`
on load and every `click` (document-relative coordinates), batches events, and
flushes on a timer and on page hide via `sendBeacon`. Configure with
`data-endpoint` (full URL) or `data-api-base` (origin to prefix `/api/events`).

In this app the tracker is loaded on the storefront via `app/components/Tracker.tsx`,
which also fires a `page_view` on client-side route changes (Next.js SPA
navigation) so multi-page journeys are captured.

## Storefront (the tracked site)

A working demo store, **UA**, is the front door of the app and is what the
tracker records:

- `/` — homepage: hero + best-selling grid with Best Selling / New / Hot tabs.
- `/product/[id]` — product detail page (size/color/add-to-cart, related items).

Click around the store, then open the dashboard to see the sessions and heatmap
populate. Product photos are loaded from Unsplash via plain `<img>` tags (no
`next/image` remote config needed).

## Dashboard (the analytics tool)

Lives under `/dashboard` so it is separate from the tracked store and is **not**
itself tracked:

- `/dashboard` — **Sessions**: table of sessions with counts; "View journey"
  opens a chronological timeline of that session's events.
- `/dashboard/heatmap` — **Heatmap**: pick a page, see clicks rendered as
  density blobs on a canvas.

## Assumptions & trade-offs

- Single Next.js app serves the storefront, the API, and the dashboard. The
  store is the tracked product; the dashboard is the analytics tool.
- Sessions are anonymous, identified solely by a client-generated `sessionId`.
- Click coordinates are document-relative (`pageX/pageY`); the heatmap renders
  against the page's own dimensions rather than a fixed viewport.
- Product images are remote Unsplash URLs, so the store needs internet access to
  render them.
