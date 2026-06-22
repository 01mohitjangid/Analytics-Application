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
  api/                 # Backend route handlers (the API)
    health/route.ts    # DB connectivity check
lib/
  mongodb.ts           # Cached MongoDB connection (hot-reload safe)
  events.ts            # Typed `events` collection + index setup
types/
  analytics.ts         # Shared event/session/click types
public/
  tracker.js           # Client-side tracking script (added in step 3)
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

_Documented in step 2._

## Assumptions & trade-offs

- Single Next.js app serves both API and dashboard (see rationale above).
- Sessions are anonymous, identified solely by a client-generated `sessionId`.
- Click coordinates are document-relative (`pageX/pageY`); the heatmap renders
  against the page's own dimensions rather than a fixed viewport.
