# Search & Discovery — Product Decision Record

## Problem

The storefront's search was a bare text input doing an exact-substring match against product name/SKU, with no filters beyond category, no sort besides price, no typo tolerance, no suggestions, and — critically — **no way to know whether it worked**. There was no data on what people searched for, whether they found anything, or whether a search led to a click, an add-to-cart, or a purchase.

## User

The shopper who arrives with intent already formed ("I want running shoes under ₹2000") rather than one who wants to browse — search is the highest-intent surface on the storefront, so a broken or opaque search disproportionately costs conversions.

## Hypothesis

If search tolerates typos, understands simple natural-language price/category phrasing, offers autocomplete and useful filters, and surfaces a helpful path forward on a zero-result query instead of a dead end — then search success rate and search→click rate will rise, and the operator will be able to see *which* queries are failing well enough to act on them (fix a product title, add a missing category, restock an item).

## Proposed solution

1. **Instrumentation first.** An `AnalyticsEvent` table + a tiny client SDK, wired into the real journey (homepage → search → view → cart → checkout → purchase), so every claim below is measurable, not asserted. See `PRODUCT_METRICS.md`.
2. **Search UX**, all client-side over the already-loaded catalog (small enough that this is legitimate, not a shortcut — see Trade-offs):
   - Autocomplete/suggestions (products + categories + recent searches) in the navbar, with keyboard navigation.
   - Typo tolerance: exact-substring fast path, falling back to a small edit-distance budget per word (`shrit` still finds "shirt").
   - Category-aware matching (a query can match a category name, not just a product name).
   - Filters: price range, in-stock only, category (rating/brand filters deliberately **not** added — see `PRD.md`, no real data backs them).
   - Sort: relevance (default), price, name, and a real **Popularity** sort backed by actual `SaleItem` sales data (reused from the existing best-sellers aggregation, not a new metric).
   - Rule-based (not LLM) natural-language parsing: `"running shoes under 2000"` → extracts a max price and, if the remaining text matches a real category name, a category filter — leaving the rest as the text query. Deliberately not an LLM call: the doc's own instruction is "don't over-engineer, use the existing backend," and a handful of regexes fully cover the two example patterns (`under/above/between <price>`, category-name matching) without adding latency, cost, or a failure mode to every keystroke.
   - Recent searches (`localStorage`) and a "no results" state offering a clear-filters action plus a real popular-products fallback (not empty).
3. **Search Analytics** for staff: top queries, zero-result queries, search success rate, search→click rate — the same event stream, a different slice — feeding directly into the Action Required panel so a failing query is something staff actually sees, not just data sitting in a table.

## Success metric

**Search success rate** (`% of search_performed events with resultCount > 0`) and **zero-result rate**, tracked over time as the catalog and query variety grow.

## Secondary metrics

Search→click rate, search→cart rate (derivable via the funnel from sessions that both searched and reached add-to-cart), Popularity-sort usage as a signal that shoppers value ranked-by-demand results.

## Guardrail metrics

Total searches should not drop after shipping (a sign the new UI — autocomplete dropdown, extra filters — is adding friction rather than removing it). Page weight / time-to-interactive on the product listing page should stay flat, since all matching runs client-side.

## Trade-offs

- **Client-side matching over a dedicated search backend/index**: correct at the current catalog size (tens of products); would need revisiting (Postgres trigram index at minimum, a real search service at real scale) if the catalog grows to thousands of SKUs. Documented explicitly rather than silently assumed.
- **Rule-based NL parsing over an LLM call**: faster, free, and fully deterministic, but only understands the patterns it's coded for (`under/above/between` + known category names) — it won't parse arbitrary phrasing like "cheap shoes for running." A future iteration could fall back to the existing OpenAI integration (already in the codebase for recommendations) for queries the rule-based parser doesn't match, but that's explicitly deferred, not silently half-built.
- **Funnel is stage-count, not strict per-session ordering** — see the caveat in `PRODUCT_METRICS.md`.

## Future improvements

- Postgres full-text/trigram search once client-side filtering stops scaling.
- LLM fallback for NL queries the regex parser misses.
- Search feedback ("Did you find what you were looking for?") to get a direct signal alongside the behavioral one — scoped as P1, not built this iteration (see the implementation plan).
