# Diner Dash: India Edition (Boilerplate)

Production-ready Next.js starter for the Snowflake Buildathon game:
- Next.js 16 + App Router
- TypeScript (strict)
- Tailwind CSS v4
- Framer Motion
- Chart.js + react-chartjs-2
- Zustand state management
- Zod event contracts
- Kafka-ready API route scaffold
- Vitest + Testing Library + Playwright

## Requirements
- Node.js 20+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm run test:watch
npm run test:e2e
npm run format
npm run format:check
```

## Project Structure

```text
docs/
  PROJECT_PRD.md
  IMPLEMENTATION_PLAN.md
src/
  app/
    api/event/route.ts
    layout.tsx
    page.tsx
  components/game/
    AnalyticsPreview.tsx
    DishPanel.tsx
    GameHud.tsx
    GameShell.tsx
    LevelCards.tsx
    PlateSlots.tsx
  lib/
    charts/register.ts
    events/emitter.ts
    events/schema.ts
    game/config.ts
    game/scoring.ts
    game/store.ts
    game/types.ts
    utils/cn.ts
```

## Environment Variables

Defined in `.env.example`:
- `NEXT_PUBLIC_EVENT_ENDPOINT`
- `KAFKA_BROKERS`
- `KAFKA_TOPIC`
- `KAFKA_CLIENT_ID`

## Notes
- `/api/event` currently validates and acknowledges events; Kafka publishing is the next integration step.
- The home page already includes a starter gameplay shell and chart preview so you can build on top without re-scaffolding.
