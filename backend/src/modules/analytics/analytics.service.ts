import prisma from "../../lib/prisma.js";
import type { Prisma } from "../../generated/client.js";
import { getLowStockInventory } from "../inventory/inventory.service.js";

export const EVENT_TYPES = [
  "homepage_viewed",
  "search_performed",
  "search_result_clicked",
  "product_viewed",
  "product_added_to_cart",
  "product_removed_from_cart",
  "checkout_started",
  "purchase_completed",
  "recommendation_viewed",
  "recommendation_clicked",
  "product_filtered",
  "product_sorted",
  "order_cancelled",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export function isValidEventType(value: unknown): value is EventType {
  return (
    typeof value === "string" &&
    (EVENT_TYPES as readonly string[]).includes(value)
  );
}

interface RecordEventInput {
  eventType: string;
  sessionId: string;
  customerId?: number;
  productId?: number;
  device?: string;
  metadata?: Record<string, unknown>;
}

export async function recordEvents(events: RecordEventInput[]) {
  const valid = events.filter(
    (e) => isValidEventType(e.eventType) && typeof e.sessionId === "string" && e.sessionId.length > 0
  );

  if (valid.length === 0) {
    return { count: 0 };
  }

  return prisma.analyticsEvent.createMany({
    data: valid.map((e) => ({
      eventType: e.eventType,
      sessionId: e.sessionId,
      ...(e.customerId !== undefined && { customerId: e.customerId }),
      ...(e.productId !== undefined && { productId: e.productId }),
      ...(e.device !== undefined && { device: e.device }),
      ...(e.metadata !== undefined && {
        metadata: e.metadata as Prisma.InputJsonValue,
      }),
    })),
  });
}

function sinceDate(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function distinctSessionCount(eventType: EventType, since: Date) {
  const rows = await prisma.analyticsEvent.findMany({
    where: { eventType, createdAt: { gte: since } },
    select: { sessionId: true },
    distinct: ["sessionId"],
  });

  return rows.length;
}

const FUNNEL_STAGES: { key: string; label: string; eventType: EventType }[] = [
  { key: "homepage", label: "Homepage", eventType: "homepage_viewed" },
  { key: "search", label: "Search", eventType: "search_performed" },
  { key: "product_view", label: "Product View", eventType: "product_viewed" },
  { key: "add_to_cart", label: "Add to Cart", eventType: "product_added_to_cart" },
  { key: "checkout", label: "Checkout", eventType: "checkout_started" },
  { key: "purchase", label: "Purchase", eventType: "purchase_completed" },
];

export async function getFunnel(days: number) {
  const since = sinceDate(days);

  const stages = [];
  let previousCount: number | null = null;

  for (const stage of FUNNEL_STAGES) {
    const count = await distinctSessionCount(stage.eventType, since);

    const dropOffPercent =
      previousCount !== null && previousCount > 0
        ? Math.round(((previousCount - count) / previousCount) * 1000) / 10
        : null;

    stages.push({
      key: stage.key,
      label: stage.label,
      sessions: count,
      dropOffPercent,
    });

    previousCount = count;
  }

  return stages;
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function rate(numerator: number, denominator: number) {
  return denominator > 0 ? round((numerator / denominator) * 100) : 0;
}

export async function getSummaryMetrics(days: number) {
  const since = sinceDate(days);

  const [
    totalUsers,
    activeUserRows,
    searchEvents,
    homepageSessions,
    searchSessions,
    productViewSessions,
    addToCartSessions,
    checkoutSessions,
    purchaseSessions,
    recommendationViewed,
    recommendationClicked,
    onlineSales,
    onlineCustomerOrderCounts,
  ] = await Promise.all([
    prisma.customer.count({ where: { password: { not: null } } }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since }, customerId: { not: null } },
      select: { customerId: true },
      distinct: ["customerId"],
    }),
    prisma.analyticsEvent.findMany({
      where: { eventType: "search_performed", createdAt: { gte: since } },
      select: { metadata: true },
    }),
    distinctSessionCount("homepage_viewed", since),
    distinctSessionCount("search_performed", since),
    distinctSessionCount("product_viewed", since),
    distinctSessionCount("product_added_to_cart", since),
    distinctSessionCount("checkout_started", since),
    distinctSessionCount("purchase_completed", since),
    prisma.analyticsEvent.count({
      where: { eventType: "recommendation_viewed", createdAt: { gte: since } },
    }),
    prisma.analyticsEvent.count({
      where: { eventType: "recommendation_clicked", createdAt: { gte: since } },
    }),
    prisma.sale.findMany({
      where: {
        source: "ONLINE",
        status: "COMPLETED",
        createdAt: { gte: since },
      },
      select: { total: true, customerId: true },
    }),
    prisma.sale.groupBy({
      by: ["customerId"],
      where: { source: "ONLINE", status: "COMPLETED", customerId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const searchesWithResults = searchEvents.filter((e) => {
    const meta = e.metadata as { resultCount?: number } | null;
    return typeof meta?.resultCount === "number" && meta.resultCount > 0;
  }).length;

  const totalRevenue = onlineSales.reduce((sum, s) => sum + Number(s.total), 0);
  const aov = onlineSales.length > 0 ? round(totalRevenue / onlineSales.length, 2) : 0;

  const repeatCustomers = onlineCustomerOrderCounts.filter((c) => c._count._all > 1).length;

  return {
    totalUsers,
    activeUsers: activeUserRows.length,
    searches: searchEvents.length,
    searchSuccessRate: rate(searchesWithResults, searchEvents.length),
    productViews: productViewSessions,
    addToCartRate: rate(addToCartSessions, productViewSessions),
    cartAbandonmentRate: rate(addToCartSessions - checkoutSessions, addToCartSessions),
    checkoutConversionRate: rate(purchaseSessions, checkoutSessions),
    purchaseConversionRate: rate(purchaseSessions, homepageSessions),
    averageOrderValue: aov,
    repeatPurchaseRate: rate(repeatCustomers, onlineCustomerOrderCounts.length),
    recommendationCtr: rate(recommendationClicked, recommendationViewed),
    homepageSessions,
    searchSessions,
  };
}

export async function getSearchAnalytics(days: number) {
  const since = sinceDate(days);

  const [searchEvents, clickEvents] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { eventType: "search_performed", createdAt: { gte: since } },
      select: { sessionId: true, metadata: true, createdAt: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { eventType: "search_result_clicked", createdAt: { gte: since } },
      select: { sessionId: true },
      distinct: ["sessionId"],
    }),
  ]);

  const queryStats = new Map<
    string,
    { query: string; count: number; zeroResultCount: number }
  >();

  let zeroResultSearches = 0;
  let successfulSearches = 0;
  const searchSessionIds = new Set<string>();

  for (const event of searchEvents) {
    searchSessionIds.add(event.sessionId);

    const meta = event.metadata as { query?: string; resultCount?: number } | null;
    const query = (meta?.query ?? "").trim().toLowerCase();
    const resultCount = meta?.resultCount ?? 0;

    if (!query) continue;

    const entry = queryStats.get(query) ?? { query, count: 0, zeroResultCount: 0 };
    entry.count += 1;

    if (resultCount === 0) {
      entry.zeroResultCount += 1;
      zeroResultSearches += 1;
    } else {
      successfulSearches += 1;
    }

    queryStats.set(query, entry);
  }

  const allQueries = Array.from(queryStats.values()).sort((a, b) => b.count - a.count);

  const topQueries = allQueries.slice(0, 15);

  const zeroResultQueries = allQueries
    .filter((q) => q.zeroResultCount > 0)
    .sort((a, b) => b.zeroResultCount - a.zeroResultCount)
    .slice(0, 15);

  const clickSessionIds = new Set(clickEvents.map((e) => e.sessionId));
  const searchToClickSessions = Array.from(searchSessionIds).filter((id) =>
    clickSessionIds.has(id)
  ).length;

  return {
    totalSearches: searchEvents.length,
    searchSuccessRate: rate(successfulSearches, searchEvents.length),
    zeroResultRate: rate(zeroResultSearches, searchEvents.length),
    searchToClickRate: rate(searchToClickSessions, searchSessionIds.size),
    topQueries,
    zeroResultQueries,
  };
}

export async function getHighCancellationProducts(days: number, limit = 5) {
  const since = sinceDate(days);

  const items = await prisma.saleItem.findMany({
    where: {
      createdAt: { gte: since },
      sale: { status: "CANCELLED" },
    },
    include: {
      product: {
        select: { id: true, name: true, sku: true },
      },
    },
  });

  const counts = new Map<number, { productId: number; name: string; sku: string; cancelledCount: number }>();

  for (const item of items) {
    const entry = counts.get(item.productId) ?? {
      productId: item.productId,
      name: item.product.name,
      sku: item.product.sku,
      cancelledCount: 0,
    };

    entry.cancelledCount += item.quantity;
    counts.set(item.productId, entry);
  }

  return Array.from(counts.values())
    .sort((a, b) => b.cancelledCount - a.cancelledCount)
    .slice(0, limit);
}

export async function getActionRequired(days: number) {
  const [lowStock, search, highCancellation] = await Promise.all([
    getLowStockInventory(),
    getSearchAnalytics(days),
    getHighCancellationProducts(days),
  ]);

  return {
    lowStock: lowStock
      .filter((item) => item.quantity > 0)
      .slice(0, 5),
    outOfStock: lowStock.filter((item) => item.quantity === 0).slice(0, 5),
    zeroResultQueries: search.zeroResultQueries.slice(0, 5),
    highCancellation,
  };
}
