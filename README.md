<p align="center">
  <img src="public/logo.png" alt="Diner Dash Logo" width="120" />
</p>

<h1 align="center">Diner Dash: India Edition</h1>

<p align="center">
  A fast-paced Indian restaurant simulation where every gameplay action emits structured events and powers live operational analytics.
</p>

<p align="center">
  <a href="https://github.com/0xvaishnavi/DinerDash">GitHub</a> &nbsp;&middot;&nbsp;
  <a href="https://example.com">Live Demo</a> &nbsp;&middot;&nbsp;
  <a href="https://example.com">Demo Video</a>
</p>


## 🖼 Preview

| | |
|:-:|:-:|
| ![](public/output/loader.png) | ![](public/output/levels.png) |
| ![](public/output/rules.png) | ![](public/output/level1.png) |
| ![](public/output/orders.png) | ![](public/output/dashboard.png) |
| ![](public/output/dashboard-1.png) | ![](public/output/dashboard-2.png) |

## 🎨 Theme and Game Idea

**Theme:** Indian cafe, chibi art style, culturally rooted dishes, warm colors (saffron/maroon/turquoise/gold).  
**Core Idea:** Model restaurant operations as a real-time business system.

In gameplay terms:
- Guests arrive and place dish requests.
- The player manages movement, dish pickup, serving speed, and mistakes.
- Revenue and reputation change in real time.

In analytics terms:
- Every action emits event data.
- Pipelines aggregate behavior into business KPIs.
- Dashboard tells a real ops story: funnel drop-off, SLA speed bands, utilization, satisfaction, and dish profitability.

## 🏆 Why This Is Buildathon-Centric

- Real business mapping: restaurant flow mirrors delivery/e-commerce operations.
- Event-first design: 12 event types across the full game lifecycle.
- End-to-end analytics: browser events -> ingestion -> Snowflake queries -> live charts.
- Session-aware analysis: dashboard can isolate a single gameplay session.

## 🎮 Gameplay Mechanics

Customers walk in, sit at a table, and place orders. You pick up dishes, carry them over, and serve before patience runs out. The faster you serve, the more coins and reputation you earn — green-tier serves reward the most, while expired orders cost you reputation.

Four levels scale the chaos: from 4 tables with a single plate in hand, all the way to 8 tables with rapid-fire arrivals and triple plate juggling.

## 🏗 Architecture

<p align="center">
  <img src="public/output/architecture.png" alt="Architecture Diagram" width="800" />
</p>

## 📊 Dashboard Views

- Real-Time Order Funnel
- Speed Tier Distribution
- Customer Satisfaction Trend
- Revenue Per Dish
- Table Utilization Over Time
- Service Throughput Pressure
- Dish Demand vs Fulfillment

Additional validation panel includes:
- total events
- distinct event types
- missing event types
- last event timestamp
- top event counts

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| State | Zustand |
| Charts | Chart.js + react-chartjs-2 |
| API | Next.js API Routes |
| Validation | Zod |
| Data Warehouse | Snowflake SDK |
| Linting | ESLint + Prettier |
| Testing | Vitest |

## 📁 Project Structure

```text
src/
  app/
    api/event/route.ts
    api/dashboard/metrics/route.ts
    dashboard/page.tsx
    info/page.tsx
    page.tsx
  components/
    game/
    dashboard/
  lib/
    events/
    game/
    snowflake/
```

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Install and Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

From `.env.example`:

```bash
NEXT_PUBLIC_EVENT_ENDPOINT=/api/event

KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC=diner-dash-events
KAFKA_CLIENT_ID=diner-dash-web

SNOWFLAKE_ACCOUNT=your-account-identifier
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_DATABASE=DINER_DASH
SNOWFLAKE_SCHEMA=GAME_EVENTS
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_ROLE=ACCOUNTADMIN
```

## 📜 Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```
