# RetailFlow — Product Requirements Document

## Overview

RetailFlow is a two-sided retail platform: a **retailer admin dashboard** (POS, inventory, order fulfillment, analytics) and an **AI-powered customer storefront** (browsing, accounts, cart, checkout, personalized recommendations). Both apps share one PostgreSQL database and one Express REST API.

## Users

| User | Needs |
|---|---|
| **Shopper** (customer) | Find the right product quickly, trust the price/availability shown, check out with minimal friction, track an order after purchase. |
| **Retailer / Store Ops** (staff) | Run in-store POS sales, keep stock accurate, fulfill online orders, and — the focus of this iteration — know *why* the numbers are what they are, not just what they are. |

## Problem

The storefront originally had no way to answer basic product questions: *Do customers find what they're searching for? Where do they drop off between browsing and buying? Which searches return nothing, and what should we do about it?* Every "recommendation" was either fully AI-generated or fully generic — there was no behavioral signal (views, past purchases) feeding personalization, and no instrumentation to tell whether any of it worked.

## This iteration's scope

Chosen focus: **Search & Discovery**, instrumented end-to-end. Rationale — search/discovery/personalization is the core of how a shopper actually finds products on a marketplace, and it's the one area where "ship a feature" and "measure if it worked" naturally form one coherent story (see `SEARCH.md`).

**Shipped:**
1. An event-tracking backbone (`AnalyticsEvent`) capturing the real customer journey — see `PRODUCT_METRICS.md` for the exact taxonomy.
2. Search UX: autocomplete, typo tolerance, category-aware matching, price/category/in-stock filters, sort (relevance/price/popularity), rule-based natural-language price parsing, recent searches, a helpful no-results state.
3. Personalization additions that reuse existing data rather than new AI calls: Recently Viewed, Because You Viewed X, Trending in Your Category.
4. A Product Analytics dashboard (funnel + core rates) and a Search Analytics view (top/zero-result queries, search→click rate) for staff.
5. An Action Required panel synthesizing low stock, out-of-stock, high-cancellation products, and zero-result search queries into one actionable list.

**Explicitly not shipped this iteration** (see the plan's P2 list for the full reasoning): product ratings/reviews and a "rating filter" (no real rating data exists — the star ratings shown on product cards are cosmetic placeholders, clearly not wired to filtering), brand filtering (no brand field in the catalog), product comparison, back-in-stock/price-drop notifications (no delivery infra), product variants, and a general-purpose multi-experiment framework.

## Success metrics

Defined precisely in `PRODUCT_METRICS.md`. Headline ones for this iteration: search success rate, zero-result rate, search→click rate, add-to-cart rate, cart abandonment, checkout/purchase conversion. All computed live from stored events — never hardcoded or simulated.

## Non-goals

- Replacing Postgres full-text/vector search with a dedicated search engine (Elasticsearch/Algolia) — catalog size (tens of products) doesn't justify it yet; documented as a future improvement if catalog scale grows.
- Real-time analytics (current dashboard queries on-demand; no streaming pipeline).
- Multi-tenant retailer support — this is a single-retailer platform.
