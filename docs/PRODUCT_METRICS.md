# Product Metrics — Event Taxonomy & Formulas

Every metric on the admin Analytics page is computed live from the `AnalyticsEvent` table (or real `Sale` data) at request time — nothing here is hardcoded, seeded, or simulated. This document exists so that claim is checkable: for each metric, the exact query/formula is listed, so you can reproduce it against the database directly.

Source of truth: `backend/src/modules/analytics/analytics.service.ts`.

## Event taxonomy

Every event has: `eventType`, `sessionId` (client-generated UUID, persisted in `localStorage`, links an anonymous journey across pages), `customerId` (nullable — set only when the shopper is logged in), `productId` (nullable), `device` (`"mobile" | "desktop"`, derived from viewport width, not fingerprinted), `metadata` (JSON, event-specific), `createdAt`.

| Event | Fired when | Key metadata |
|---|---|---|
| `homepage_viewed` | Storefront homepage mounts | — |
| `search_performed` | 600ms after the search box text stabilizes (debounced — not per keystroke) | `query`, `resultCount` |
| `search_result_clicked` | A product is clicked from an active search's results grid | `query` |
| `product_viewed` | A product detail page successfully loads | — |
| `product_added_to_cart` | Add to Cart, from any page (wired once at the shared cart-state level) | `quantity` |
| `product_removed_from_cart` | Removed from cart | — |
| `checkout_started` | Checkout page mounts with a non-empty cart | `itemCount` |
| `purchase_completed` | An order is successfully placed | `orderId`, `total`, `itemCount` |
| `recommendation_viewed` | A recommendation section (Recommended for You / You May Also Like / Frequently Bought Together / Recently Viewed / Because You Viewed / Trending) renders with ≥1 product | `section`, `count` |
| `recommendation_clicked` | A product within a recommendation section is clicked through (not counted for clicking "Add to Cart" inside the card — see `RecommendedProducts.tsx`) | `section` |
| `product_filtered` | Category, price range, or in-stock filter changes (skips the initial render) | `categoryId`, `minPrice`, `maxPrice`, `inStockOnly` |
| `product_sorted` | Sort option changes (skips the initial render) | `sort` |
| `order_cancelled` | Staff cancels an online order from the admin Online Orders page (server-recorded, since there's no browser session for a staff action — `sessionId` is synthesized as `staff-<userId>`) | `saleId`, `invoiceNumber` |

Ingestion: `POST /api/analytics/events` (public, optional customer auth), fire-and-forget from the client — a tracking failure never blocks or breaks the page.

## Funnel

`GET /api/analytics/funnel?days=N` — for each stage, count of **distinct `sessionId`s** with at least one matching event in the window:

`Homepage (homepage_viewed) → Search (search_performed) → Product View (product_viewed) → Add to Cart (product_added_to_cart) → Checkout (checkout_started) → Purchase (purchase_completed)`

`dropOffPercent` between consecutive stages = `round(((previous - current) / previous) * 1000) / 10`.

Caveat, stated plainly: this is a **stage-count funnel**, not a strict per-session ordered funnel (a session that adds to cart via a category browse without searching still counts at the Add to Cart stage). That's a standard simplification for a project this size — flagged here rather than left implicit.

## Summary metrics (`GET /api/analytics/summary?days=N`)

- **Total Registered Users** — `Customer` rows with a non-null `password` (i.e. real accounts, excluding POS walk-in records).
- **Active Users** — distinct `customerId` across all events in the window.
- **Searches** — count of `search_performed` events.
- **Search Success Rate** — `%` of `search_performed` events where `metadata.resultCount > 0`.
- **Product Views** — distinct sessions with a `product_viewed` event (funnel stage reused).
- **Add-to-Cart Rate** — `add_to_cart sessions / product_view sessions`.
- **Cart Abandonment Rate** — `(add_to_cart sessions − checkout sessions) / add_to_cart sessions`.
- **Checkout Conversion Rate** — `purchase sessions / checkout sessions`.
- **Purchase Conversion Rate** — `purchase sessions / homepage sessions` (overall funnel conversion).
- **Average Order Value** — mean `Sale.total` over `COMPLETED`, `source: ONLINE` sales in the window (real transaction data, not events).
- **Repeat Purchase Rate** — `%` of customers with an online order who have more than one.
- **Recommendation CTR** — `recommendation_clicked events / recommendation_viewed events`.

## Search Analytics (`GET /api/analytics/search?days=N`)

Built by parsing `search_performed` event metadata (query text lower-cased and trimmed as the grouping key) and correlating with `search_result_clicked` by `sessionId`:

- **Top Queries** — grouped by normalized query text, sorted by frequency.
- **Zero-Result Queries** — same grouping, filtered to queries where `resultCount === 0` at least once, sorted by how often they failed. This list feeds the admin **Action Required** panel directly.
- **Search → Click Rate** — sessions that both searched and clicked a result, divided by sessions that searched.

## Action Required (`GET /api/analytics/action-required?days=N`)

A single synthesized view for store ops, combining:
- **Low inventory / Out of stock** — reuses the existing `getLowStockInventory()` (quantity ≤ minStock), no duplicated logic.
- **Frequently cancelled** — `SaleItem` rows grouped by product where the parent `Sale.status = CANCELLED`, in the window, sorted by cancelled quantity.
- **Search issues** — the top zero-result queries from Search Analytics.

## Known limitations

- No device/location breakdown beyond the coarse `mobile`/`desktop` field — no IP geolocation is captured (a deliberate scope + privacy decision, see `PRD.md`).
- The funnel and rates are computed per-request (no caching), fine at current data volume; would need pre-aggregation at meaningfully larger scale.
- `recommendation_viewed` counts a section render, not a per-product impression — so CTR is "click rate on a shown section," not "click rate per product shown."
