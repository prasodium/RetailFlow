# RetailFlow

RetailFlow is a full-stack Retail Sales & Inventory Intelligence Platform with a retailer admin dashboard and an AI-powered customer storefront.

## Apps

- `backend/` — Express + Prisma (PostgreSQL) REST API
- `frontend/` — Retailer admin dashboard (POS, inventory, online order fulfillment, reports)
- `shop/` — Customer-facing storefront (accounts, browsing, cart, checkout, AI recommendations)

## Technology Stack

- React, TypeScript, Vite, Tailwind CSS (both frontends)
- Node.js, Express, TypeScript, Prisma
- PostgreSQL
- OpenAI API (product recommendations, optional)

## Core Features

- Staff login and role-based access for the admin dashboard
- Product, category, and inventory management with image uploads
- POS sales and online order management (Pending → Confirmed → Packed → Shipped → Delivered)
- Customer accounts on the storefront: signup/login, order history, order tracking
- AI-powered product recommendations (homepage, product page, cart) with automatic non-AI fallback when no OpenAI key is configured
- Sales, payment, and profit reports

### Planned

- Redis, Docker, CI
- Returns, sales visits, offline-first PWA

## Setup

1. **Database**: create a PostgreSQL database and set `DATABASE_URL` in `backend/.env` (copy `backend/.env.example`).
2. Generate `JWT_STAFF_SECRET` and `JWT_CUSTOMER_SECRET` (e.g. `openssl rand -hex 32`) and set them in `backend/.env`.
3. Optionally set `OPENAI_API_KEY` in `backend/.env` for AI recommendations — without it, the app falls back to best-seller/same-category suggestions.
4. From `backend/`: `npm install && npx prisma migrate deploy && npx prisma generate`
5. Create your first admin login: `npx tsx scripts/create-staff-user.ts "Your Name" you@example.com yourpassword`
6. Run all three apps in separate terminals:
   ```bash
   cd backend && npm run dev    # http://localhost:4000
   cd frontend && npm run dev   # admin dashboard
   cd shop && npm run dev       # customer storefront
   ```

## Architecture

```text
shop (customer)         frontend (retailer admin)
      \\                        /
       \\                      /
          REST API (JWT auth)
                 |
        Node.js + Express
                 |
             PostgreSQL
```
