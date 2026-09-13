import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Eye,
  ShoppingCart,
  CreditCard,
  IndianRupee,
  Repeat,
  Sparkles,
  TrendingDown,
} from "lucide-react";

import {
  getFunnel,
  getSearchAnalytics,
  getSummary,
  type AnalyticsSummary,
  type FunnelStage,
  type SearchAnalytics,
} from "../services/analyticsService";

const DAY_OPTIONS = [7, 30, 90];

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>

        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [search, setSearch] = useState<SearchAnalytics | null>(null);

  // Derived, not stateful — avoids a synchronous setState-in-effect and
  // means changing the date range updates in place instead of flashing
  // a full loading screen.
  const loading = summary === null;

  useEffect(() => {
    Promise.all([
      getFunnel(days),
      getSummary(days),
      getSearchAnalytics(days),
    ])
      .then(([funnelData, summaryData, searchData]) => {
        setFunnel(funnelData.stages);
        setSummary(summaryData);
        setSearch(searchData);
      })
      .catch(console.error);
  }, [days]);

  const maxSessions = Math.max(1, ...funnel.map((s) => s.sessions));

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Product Analytics
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            Real usage data from the customer storefront — every number
            here is computed live from stored events, not simulated.
          </p>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border border-zinc-300 rounded-lg px-3 py-2 bg-white text-sm"
        >
          {DAY_OPTIONS.map((d) => (
            <option key={d} value={d}>
              Last {d} days
            </option>
          ))}
        </select>
      </div>

      {/* Funnel */}

      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <h2 className="font-semibold">Customer Funnel</h2>

        <p className="text-sm text-zinc-500 mt-1">
          Distinct sessions reaching each stage — Homepage → Search →
          Product View → Add to Cart → Checkout → Purchase.
        </p>

        <div className="mt-6 space-y-4">
          {funnel.map((stage) => (
            <div key={stage.key}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium">{stage.label}</span>

                <span className="text-zinc-500">
                  {stage.sessions} sessions
                  {stage.dropOffPercent !== null && stage.dropOffPercent > 0 && (
                    <span className="text-red-600 ml-2 inline-flex items-center gap-1">
                      <TrendingDown size={13} />
                      {stage.dropOffPercent}% drop-off
                    </span>
                  )}
                </span>
              </div>

              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width: `${(stage.sessions / maxSessions) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary metrics */}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard label="Total Registered Users" value={summary.totalUsers} icon={Users} />
          <StatCard label={`Active Users (${days}d)`} value={summary.activeUsers} icon={Users} />
          <StatCard label="Searches" value={summary.searches} icon={Search} />
          <StatCard label="Search Success Rate" value={`${summary.searchSuccessRate}%`} icon={Search} />
          <StatCard label="Product Views" value={summary.productViews} icon={Eye} />
          <StatCard label="Add-to-Cart Rate" value={`${summary.addToCartRate}%`} icon={ShoppingCart} />
          <StatCard label="Cart Abandonment" value={`${summary.cartAbandonmentRate}%`} icon={ShoppingCart} />
          <StatCard label="Checkout Conversion" value={`${summary.checkoutConversionRate}%`} icon={CreditCard} />
          <StatCard label="Purchase Conversion" value={`${summary.purchaseConversionRate}%`} icon={CreditCard} />
          <StatCard label="Avg. Order Value" value={`₹${summary.averageOrderValue.toFixed(2)}`} icon={IndianRupee} />
          <StatCard label="Repeat Purchase Rate" value={`${summary.repeatPurchaseRate}%`} icon={Repeat} />
          <StatCard label="Recommendation CTR" value={`${summary.recommendationCtr}%`} icon={Sparkles} />
        </div>
      )}

      {/* Search analytics */}

      {search && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-semibold">Search Analytics</h2>

            <p className="text-sm text-zinc-500 mt-1">
              {search.totalSearches} searches · {search.searchSuccessRate}% returned results ·{" "}
              {search.searchToClickRate}% led to a click
            </p>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">

            <div className="p-6">
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">
                Top Queries
              </h3>

              {search.topQueries.length === 0 ? (
                <p className="text-sm text-zinc-400">No searches yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {search.topQueries.map((q) => (
                      <tr key={q.query} className="border-b last:border-0">
                        <td className="py-2 text-zinc-700">{q.query}</td>
                        <td className="py-2 text-right text-zinc-500">
                          {q.count}×
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">
                Zero-Result Queries
              </h3>

              {search.zeroResultQueries.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  No failed searches — nice.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {search.zeroResultQueries.map((q) => (
                      <tr key={q.query} className="border-b last:border-0">
                        <td className="py-2 text-zinc-700">{q.query}</td>
                        <td className="py-2 text-right text-red-600">
                          {q.zeroResultCount}×
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
