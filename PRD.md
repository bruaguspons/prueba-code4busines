# PRD — Sales Management App

## Overview

A simple full-stack web application to manage and evaluate sales. Built to demonstrate clear architecture, TS across the stack, and testable backend code.

---

## Goals

- Create, list, and evaluate sales
- Simple and functional UI
- Clean separation between frontend and backend
- Everything runs with `docker compose up`

---

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Node.js + Express + TypeScript    |
| Frontend   | Next.js + TypeScript + Tailwind   |
| Database   | SQLite                            |
| ORM        | Prisma                            |
| Testing    | Vitest (TDD, backend only)        |
| Container  | Docker Compose                    |

---

## Data Model

### Sale

| Field     | Type    | Notes               |
|-----------|---------|---------------------|
| id        | integer | Auto-increment PK   |
| customer  | string  | Required            |
| product   | string  | Required            |
| amount    | number  | Required, positive  |
| score     | integer | Nullable, 1–5       |
| createdAt | date    | Auto-set            |

---

## API Endpoints

### `GET /sales`
Returns a list of all sales.

**Response `200`**
```json
[
  {
    "id": 1,
    "customer": "Acme Corp",
    "product": "Widget Pro",
    "amount": 1500.00,
    "score": 4,
    "createdAt": "2026-03-30T12:00:00Z"
  }
]
```

---

### `POST /sales`
Creates a new sale.

**Request body**
```json
{
  "customer": "Acme Corp",
  "product": "Widget Pro",
  "amount": 1500.00
}
```

**Response `201`**
```json
{
  "id": 1,
  "customer": "Acme Corp",
  "product": "Widget Pro",
  "amount": 1500.00,
  "score": null,
  "createdAt": "2026-03-30T12:00:00Z"
}
```

**Validation errors → `400`**

---

### `POST /sales/:id/evaluate`
Assigns a score to an existing sale.

**Request body**
```json
{
  "score": 4
}
```

**Response `200`** — returns the updated sale.

**Errors**
- `400` — score out of range (must be 1–5)
- `404` — sale not found

---

## Screens

### 1. Sales List (Home `/`)
- Table with columns: Customer, Product, Amount, Score, Actions
- Score column shows "—" when null; shows average score in the table footer
- "New Sale" button opens the create form
- Each row has an "Evaluate" action (inline or modal)

### 2. Create Sale (modal or `/sales/new`)
- Fields: Customer, Product, Amount
- Basic validation (all fields required, amount > 0)
- Submit → sale appears in list
- Loading state on submit button

### 3. Evaluate Sale (inline modal)
- Score selector: 1 to 5 (stars or buttons)
- Submit → score updates in table immediately
- Loading state during submit

---

## Backend Architecture

```
backend/
├── src/
│   ├── routes/
│   │   └── sales.ts          # Express router
│   ├── controllers/
│   │   └── salesController.ts
│   ├── services/
│   │   └── salesService.ts   # Business logic (unit-tested)
│   ├── db/
│   │   └── prisma.ts         # Prisma client singleton
│   └── app.ts                # Express app setup
├── tests/
│   ├── salesService.test.ts
│   └── salesRoutes.test.ts
├── prisma/
│   └── schema.prisma
├── Dockerfile
└── package.json
```

---

## Frontend Architecture

```
frontend/
├── src/
│   ├── app/
│   │   └── page.tsx          # Sales list (home)
│   ├── components/
│   │   ├── SalesTable.tsx
│   │   ├── CreateSaleModal.tsx
│   │   └── EvaluateModal.tsx
│   ├── lib/
│   │   └── api.ts            # Fetch wrappers for backend
│   └── types/
│       └── sale.ts
├── Dockerfile
└── package.json
```

---

## TDD Approach (Backend)

Tests are written before or alongside implementation using **Vitest**.

### Test coverage targets

| Area              | Type           | Notes                                  |
|-------------------|----------------|----------------------------------------|
| `salesService`    | Unit tests     | Create, list, evaluate — pure logic    |
| `salesRoutes`     | Integration    | HTTP layer with supertest              |

### Test cases (minimum)

**salesService**
- `createSale` — creates a sale with valid data
- `createSale` — throws when required fields are missing
- `createSale` — throws when amount is not positive
- `evaluateSale` — updates score for existing sale
- `evaluateSale` — throws when score is out of range (< 1 or > 5)
- `evaluateSale` — throws when sale not found
- `listSales` — returns all sales

**salesRoutes**
- `POST /sales` returns 201 with valid body
- `POST /sales` returns 400 with missing fields
- `GET /sales` returns 200 and array
- `POST /sales/:id/evaluate` returns 200 with valid score
- `POST /sales/:id/evaluate` returns 400 with invalid score
- `POST /sales/:id/evaluate` returns 404 for unknown id

---

## Docker Compose

```
services:
  backend:
    build: ./backend
    ports: ["4000:4000"]
    volumes: ["./data:/app/data"]   # SQLite file persisted here

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
```

Both services built from their own `Dockerfile`. No external DB service needed (SQLite file on disk).

---

## Bonus (if time allows)

- Average score shown in table footer
- Form validation with error messages per field
- Loading spinners / disabled buttons during async actions
- Toast notifications on success/error
- Responsive layout

---

## Out of Scope

- Authentication / authorization
- User roles
- Complex dashboards or analytics
- Pagination (unless list grows very large)
