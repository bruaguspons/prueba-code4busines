# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Full-stack sales management app. Backend: Node/Express/TypeScript. Frontend: Next.js/TypeScript/Tailwind. Database: SQLite via Prisma. Runs via Docker Compose.

## Commands

### Running the app
```bash
docker compose up           # start everything
docker compose up --build   # rebuild images first
```

### Backend (from `backend/`)
```bash
npm run dev         # start dev server (ts-node or tsx watch)
npm test            # run all tests
npm test -- <file>  # run a single test file, e.g. npm test -- tests/salesService.test.ts
npm run lint        # eslint
npm run build       # compile TS to dist/
```

### Frontend (from `frontend/`)
```bash
npm run dev     # Next.js dev server
npm run build   # production build
npm run lint    # eslint + next lint
```

### Database (from `backend/`)
```bash
npx prisma migrate dev      # apply migrations (dev)
npx prisma migrate deploy   # apply migrations (prod/Docker)
npx prisma studio           # visual DB browser
```

## Architecture

### Backend (`backend/src/`)
Layered: `routes → controllers → services → db`.

- **`app.ts`** — Express app factory (no `listen` call), exported for use in tests and `server.ts`
- **`routes/sales.ts`** — Express router, maps HTTP verbs to controller methods
- **`controllers/salesController.ts`** — Parses/validates request, calls service, sends response
- **`services/salesService.ts`** — All business logic; the only layer unit tests target directly
- **`db/prisma.ts`** — Prisma client singleton imported everywhere that needs DB access

Tests live in `tests/` and split into unit (`salesService.test.ts`) and integration (`salesRoutes.test.ts`). Integration tests spin up the Express app with supertest — no running server needed.

### Frontend (`frontend/src/`)
- **`app/page.tsx`** — Home page, fetches and renders the sales list
- **`components/`** — `SalesTable`, `CreateSaleModal`, `EvaluateModal`
- **`lib/api.ts`** — All `fetch` calls to the backend; single source of truth for the API contract
- **`types/sale.ts`** — Shared `Sale` type used across components and `api.ts`

`NEXT_PUBLIC_API_URL` env var controls the backend base URL (set in Docker Compose for prod, defaults to `http://localhost:4000` in dev).

## TDD convention

Backend follows TDD. Write tests in `tests/` before or alongside implementation. Service-layer tests mock Prisma using Vitest's `vi.mock`. Route tests use `supertest` against the real Express app with an in-memory SQLite test DB.

## API contract

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | /sales                | List all sales           |
| POST   | /sales                | Create a sale            |
| POST   | /sales/:id/evaluate   | Set score (1–5) on sale  |

Score must be an integer 1–5. Amount must be a positive number. All three `POST /sales` fields (`customer`, `product`, `amount`) are required.
