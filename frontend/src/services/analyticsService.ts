import api from "./api";

export interface FunnelStage {
  key: string;
  label: string;
  sessions: number;
  dropOffPercent: number | null;
}

export interface AnalyticsSummary {
  days: number;
  totalUsers: number;
  activeUsers: number;
  searches: number;
  searchSuccessRate: number;
  productViews: number;
  addToCartRate: number;
  cartAbandonmentRate: number;
  checkoutConversionRate: number;
  purchaseConversionRate: number;
  averageOrderValue: number;
  repeatPurchaseRate: number;
  recommendationCtr: number;
  homepageSessions: number;
  searchSessions: number;
}

export interface QueryStat {
  query: string;
  count: number;
  zeroResultCount: number;
}

export interface SearchAnalytics {
  days: number;
  totalSearches: number;
  searchSuccessRate: number;
  zeroResultRate: number;
  searchToClickRate: number;
  topQueries: QueryStat[];
  zeroResultQueries: QueryStat[];
}

export async function getFunnel(days = 30): Promise<{ days: number; stages: FunnelStage[] }> {
  const response = await api.get("/analytics/funnel", { params: { days } });
  return response.data.data;
}

export async function getSummary(days = 30): Promise<AnalyticsSummary> {
  const response = await api.get("/analytics/summary", { params: { days } });
  return response.data.data;
}

export async function getSearchAnalytics(days = 30): Promise<SearchAnalytics> {
  const response = await api.get("/analytics/search", { params: { days } });
  return response.data.data;
}

export interface LowStockItem {
  id: number;
  quantity: number;
  minStock: number;
  product: { id: number; name: string; sku: string };
}

export interface CancelledProduct {
  productId: number;
  name: string;
  sku: string;
  cancelledCount: number;
}

export interface ActionRequired {
  lowStock: LowStockItem[];
  outOfStock: LowStockItem[];
  zeroResultQueries: QueryStat[];
  highCancellation: CancelledProduct[];
}

export async function getActionRequired(days = 30): Promise<ActionRequired> {
  const response = await api.get("/analytics/action-required", {
    params: { days },
  });
  return response.data.data;
}
