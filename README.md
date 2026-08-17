# Furniworld

A furniture marketplace for Kenyan homes and offices, built with the MERN stack —
storefront, cart, checkout, order tracking and a full staff dashboard.

Live demo: frontend on Netlify, API on Render. Payments are simulated.

## Stack

| Layer | What |
|---|---|
| Frontend | React 19 + Vite, Tailwind v3, React Router v7, plain JavaScript |
| Backend | Express 4, Mongoose 8, ESM, JWT auth |
| Database | MongoDB |

## Getting started

```bash
# 1. Install everything (root, backend, frontend)
npm run install:all

# 2. Start MongoDB (workspace Docker instance)
docker compose -f ../infra/docker-compose.yml up -d

# 3. Configure the backend
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Seed the catalogue, then the demo accounts and orders
npm run seed
npm run seed:demo

# 5. Run both servers
npm run dev
```

The API listens on **5005** and the frontend on **5006**. Both ports are
deliberate: macOS AirPlay Receiver occupies 5000, and the frontend port is pinned
so the backend's CORS allowlist has a stable origin to match.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Both servers via `concurrently` |
| `npm run server` | API only |
| `npm run client` | Frontend only |
| `npm run build` | Production frontend build |
| `npm run seed` | Rebuild the product catalogue from `backend/data/products.js` |
| `npm run seed:demo` | Create demo accounts, orders and reviews (idempotent) |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Shopper | `demo@furniworld.ke` | `demo12345` |
| Admin | `admin@furniworld.ke` | `admin12345` |

The sign-in page has a button for each, so there is nothing to type.

## Features

**Storefront** — browse by room, filter by type, price, stock and sale status,
search, six sort orders, paginated results. Filters live in the URL, so a
filtered view is shareable and the back button behaves.

**Product pages** — image gallery with hover zoom, authored copy, full
specification table, verified-purchase reviews with a rating breakdown, and
related pieces.

**Cart** — a right-hand drawer plus a deep-linkable `/cart` page. The browser
stores only product ids and quantities; every price, stock level and total is
resolved server-side, so a cart left open for a week cannot be used to buy at a
stale price. A guest cart merges into the account on sign-in.

**Checkout** — Kenyan county-based delivery bands, 16% VAT, free delivery over
KES 150,000, three simulated payment methods. Totals are always recomputed on the
server from database prices. Stock is decremented conditionally, so two shoppers
racing for the last unit cannot both succeed.

**Account** — order history with status timeline, self-service cancellation while
an order is still cancellable, profile and password management, and your reviews.

**Admin** (`/admin`, role-guarded) — revenue and order stats, 30-day revenue
chart, best sellers, low-stock list, product CRUD with multi-image upload, order
management with enforced status transitions, user role management and review
moderation.

## Catalogue

The 50 products are real Zetu Furniture listings — genuine names, photography and
KES retail prices (4,995 to 324,995). Copy, dimensions, materials and stock levels
were written for this project, because the source listings carried no description
or specification at all.

Product images are served by the API from `backend/public/images/products` and are
committed to the repo. The database stores relative paths, so switching to a CDN
is a one-line change in `frontend/src/lib/images.js`.

## Deployment

Two pieces:

- **Frontend → Netlify** (`netlify.toml`, builds from `frontend/`). Set
  `VITE_API_URL` and `VITE_ASSET_URL` to the Render service URL.
- **API → Render** (`render.yaml`, `rootDir: backend`). Set `DATABASE_URL` and
  `PROD_FRONTEND_URL`; `JWT_SECRET` is generated.

`PROD_FRONTEND_URL` is not optional — CORS uses an explicit allowlist, so the
frontend cannot reach the API until it is set.

## Licence

MIT
