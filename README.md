# Sales Ledger

Aplicación full-stack para gestionar y evaluar ventas. Crea registros, llévalos en tabla y puntúalos del 1 al 5.

**Stack:** Node/Express/TypeScript · Next.js 16/Tailwind · SQLite/Prisma · Vitest

---

## Ejecución con npm (sin Docker)

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init   # crea la base de datos y aplica el esquema
npm run dev                          # inicia en http://localhost:4000
```

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev                          # inicia en http://localhost:3000
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Ejecución con Docker Compose

> Requiere Docker y Docker Compose instalados.

```bash
docker compose up --build
```

- Frontend → [http://localhost:3000](http://localhost:3000)
- Backend API → [http://localhost:4000](http://localhost:4000)

El archivo de base de datos SQLite se persiste en `./data/` en el host.

---

## Tests del backend

```bash
cd backend
npm install          # si aún no se hizo
npm test             # ejecuta todos los tests unitarios e de integración
```

Los tests usan una base de datos separada `prisma/test.db` que se crea y destruye automáticamente.

---

## API

| Método | Ruta                  | Descripción                    |
|--------|-----------------------|--------------------------------|
| GET    | /sales                | Lista todas las ventas         |
| POST   | /sales                | Crea una venta                 |
| POST   | /sales/:id/evaluate   | Asigna puntaje (1–5) a venta   |

### Crear una venta

```bash
curl -X POST http://localhost:4000/sales \
  -H "Content-Type: application/json" \
  -d '{"customer":"Acme Corp","product":"Widget Pro","amount":1500}'
```

### Evaluar una venta

```bash
curl -X POST http://localhost:4000/sales/1/evaluate \
  -H "Content-Type: application/json" \
  -d '{"score":4}'
```

---

## Estructura del proyecto

```
.
├── backend/
│   ├── src/
│   │   ├── app.ts                      # Fábrica de la app Express
│   │   ├── server.ts                   # Punto de entrada
│   │   ├── routes/sales.ts
│   │   ├── controllers/salesController.ts
│   │   ├── services/salesService.ts
│   │   └── db/prisma.ts
│   ├── tests/
│   │   ├── salesService.test.ts        # Tests unitarios (Prisma mockeado)
│   │   └── salesRoutes.test.ts         # Tests de integración (SQLite real)
│   └── prisma/schema.prisma
├── frontend/
│   ├── app/page.tsx                    # Página principal
│   ├── components/
│   │   ├── SalesTable.tsx
│   │   ├── CreateSaleModal.tsx
│   │   └── EvaluateModal.tsx
│   ├── lib/api.ts                      # Wrappers de fetch
│   └── types/sale.ts
└── docker-compose.yml
```
