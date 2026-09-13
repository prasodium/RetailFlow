# RetailFlow

RetailFlow is a full-stack retail platform combining a **POS / inventory admin dashboard** with an **AI-powered customer storefront**. A retailer manages products, stock, and both in-store and online orders from one dashboard; customers browse, create accounts, check out, and get OpenAI-powered product recommendations on a separate storefront app.

## Apps

This is a monorepo with three apps sharing one PostgreSQL database:

| App | Path | Purpose |
|---|---|---|
| **API** | `backend/` | Express + Prisma REST API |
| **Admin** | `frontend/` | Retailer dashboard — POS, inventory, online order fulfillment, reports |
| **Store** | `shop/` | Customer storefront — browsing, accounts, cart, checkout, AI recommendations |

## Features

### Customer Storefront (`shop`)
- Amazon.in-style marketplace UI: two-tier navy header with a category strip, homepage category tiles and per-category product rows, a filterable/sortable listing page, and a buy-box style product page (star ratings, M.R.P. strike-through pricing, Add to Cart + Buy Now)
- 32 seeded products across 9 categories (Electronics, Mobiles & Accessories, Fashion, Home & Kitchen, Beauty, Books, Sports & Fitness, Toys & Baby, Grocery) — see `backend/scripts/seed-catalog.ts`
- Product browsing with search, category filters, and images
- Customer accounts: signup/login (JWT), persistent order history
- Cart and guest or logged-in checkout
- Order tracking with a fulfillment status stepper (Pending → Confirmed → Packed → Shipped → Delivered)
- AI-powered recommendations in three places, each with a deterministic fallback so the storefront never breaks without an API key:
  - **Homepage** — "Recommended for You", personalized from a signed-in customer's browsing/purchase history; falls back to best-sellers for guests or new accounts
  - **Product page** — "You May Also Like", related items from the same category re-ranked by the model
  - **Cart** — "Frequently Bought Together", complementary add-ons not already in the cart

### Retailer Admin (`frontend`)
- Staff login (JWT, role-based `User` model)
- Product, category, and inventory management, including image uploads
- Point-of-sale sales flow with a running cart, discounts, tax, and multiple payment methods
- **Online Orders**: a dedicated view for orders placed through the storefront, separate from in-store POS sales, with guarded status transitions (e.g. an order can't jump from Pending straight to Shipped)
- Customer management, sales history with printable invoices, and sales/profit/payment-method reports

### Backend (`backend`)
- Modular Express API (`routes` → `controller` → `service` per feature), Prisma ORM over PostgreSQL via the `@prisma/adapter-pg` driver adapter
- Two independent JWT auth realms — staff and customer — with separate secrets, so a token minted for one can never be replayed against the other
- A single `Sale` model backs both POS sales and online orders (`source: POS | ONLINE`), avoiding a duplicate `Order` model while keeping existing POS behavior untouched
- AI recommendation endpoints use the official `openai` SDK with a lazily-constructed client (the server never crashes on startup if `OPENAI_API_KEY` is unset), a capped/category-filtered candidate list sent to the model, strict validation that the model only picks from real candidate IDs, and an in-memory TTL cache to avoid redundant calls

## Tech Stack

- **Frontend (both apps):** React 19, TypeScript, Vite, Tailwind CSS v4, React Router
- **Backend:** Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL
- **Auth:** JWT (`jsonwebtoken`), password hashing (`bcryptjs`)
- **AI:** OpenAI API (Chat Completions, JSON mode)
- **Uploads:** `multer`, served as static files

## Getting Started

### 1. Database

Create a PostgreSQL database and point `DATABASE_URL` at it in `backend/.env` (copy `backend/.env.example` as a starting point).

### 2. Backend environment

In `backend/.env`, set:

```
DATABASE_URL=postgresql://user:password@localhost:5432/retailflow
JWT_STAFF_SECRET=<random 32+ byte secret, e.g. `openssl rand -hex 32`>
JWT_CUSTOMER_SECRET=<a different random secret>
OPENAI_API_KEY=           # optional — recommendations fall back gracefully without it
OPENAI_MODEL=gpt-4o-mini  # optional override
PORT=4000
```

### 3. Install, migrate, seed

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate

# Create your first admin login
npx tsx scripts/create-staff-user.ts "Your Name" you@example.com yourpassword

# Populate a multi-category product catalog (idempotent — safe to re-run)
npx tsx scripts/seed-catalog.ts
```

### 4. Run everything

```bash
cd backend && npm run dev    # http://localhost:4000
cd frontend && npm run dev   # admin dashboard, http://localhost:5173
cd shop && npm run dev       # customer storefront, http://localhost:5174
```

Both frontends read their API base URL from `VITE_API_BASE_URL` in their own `.env` (defaults to `http://localhost:4000`).

## Auth Model

Two separate JWT realms, each with its own secret and localStorage token, so a leaked customer token can never authenticate as staff (or vice versa):

- **Staff** (`User` model, roles `ADMIN`/`MANAGER`/`STAFF`) — required on virtually every admin-only route: inventory, customers, reports, POS sales, and order-status updates. `POST /api/auth/staff/login`.
- **Customer** (`Customer` model) — optional on public storefront routes (so guest checkout still works) but required for order history/detail. `POST /api/auth/customer/signup`, `POST /api/auth/customer/login`. Signing up with an email that already exists as a passwordless walk-in customer (created via an in-store POS sale) claims that existing record instead of creating a duplicate.

Product browsing (`GET /api/products`, `GET /api/categories`) stays fully public.

## Order Lifecycle

Every sale — in-store or online — is a `Sale` row distinguished by `source`:

- **POS** (`source: POS`) — created instantly by staff, `orderStatus` is set straight to `DELIVERED` since there's no shipping step.
- **Online** (`source: ONLINE`) — created via `POST /api/orders` from the storefront, starts at `orderStatus: PENDING` and is advanced by staff through the admin Online Orders page: `PENDING → CONFIRMED → PACKED → SHIPPED → DELIVERED`, or `CANCELLED` from any state before `SHIPPED`. Transitions are validated server-side against an explicit allowed-transitions map.

## Scripts

| Command | Where | What |
|---|---|---|
| `npm run dev` | each app | Start the dev server |
| `npm run build` | `frontend`, `shop` | Type-check + production build |
| `npx prisma migrate deploy` | `backend` | Apply pending migrations |
| `npx tsx scripts/create-staff-user.ts <name> <email> <password> [role]` | `backend` | Create or update an admin/staff login |
| `npx tsx scripts/seed-catalog.ts` | `backend` | Seed/update the 9-category, 32-product demo catalog |

## Roadmap

- Redis, Docker, CI
- Returns, sales visits, offline-first PWA

## License

[MIT](LICENSE) © [prasodium](https://github.com/prasodium)
