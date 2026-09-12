import { useEffect, useState } from "react";
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import api from "../services/api";

interface SalesSummary {
  totalSales: number;
  revenue: number;
  subtotal: number;
  discount: number;
  tax: number;
}

interface TopProduct {
  productId: number;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
}

interface PaymentSummary {
  paymentMethod: string;
  sales: number;
  revenue: number;
}

interface ProfitSummary {
  revenue: number;
  cost: number;
  profit: number;
}

export default function Reports() {
  const [salesSummary, setSalesSummary] =
    useState<SalesSummary | null>(null);

  const [topProducts, setTopProducts] =
    useState<TopProduct[]>([]);

  const [payments, setPayments] =
    useState<PaymentSummary[]>([]);

  const [profit, setProfit] =
    useState<ProfitSummary | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const [
        salesResponse,
        productsResponse,
        paymentsResponse,
        profitResponse,
      ] = await Promise.all([
        api.get("/reports/sales-summary"),
        api.get("/reports/top-products"),
        api.get("/reports/payments"),
        api.get("/reports/profit"),
      ]);

      if (salesResponse.data.success) {
        setSalesSummary(salesResponse.data.data);
      }

      if (productsResponse.data.success) {
        setTopProducts(productsResponse.data.data);
      }

      if (paymentsResponse.data.success) {
        setPayments(paymentsResponse.data.data);
      }

      if (profitResponse.data.success) {
        setProfit(profitResponse.data.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch reports",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: number) {
    return `₹${value.toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Reports & Analytics
        </h1>

        <p className="text-sm text-zinc-500 mt-1">
          Analyze sales, revenue, products and profit.
        </p>
      </div>

      {/* Summary cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <div className="bg-white border border-zinc-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-zinc-500">
                Total Sales
              </p>

              <p className="text-2xl font-bold mt-2">
                {salesSummary?.totalSales ?? 0}
              </p>
            </div>

            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingCart size={22} />
            </div>

          </div>

        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-zinc-500">
                Revenue
              </p>

              <p className="text-2xl font-bold mt-2">
                {formatCurrency(
                  salesSummary?.revenue ?? 0
                )}
              </p>
            </div>

            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <IndianRupee size={22} />
            </div>

          </div>

        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-zinc-500">
                Total Cost
              </p>

              <p className="text-2xl font-bold mt-2">
                {formatCurrency(
                  profit?.cost ?? 0
                )}
              </p>
            </div>

            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <CreditCard size={22} />
            </div>

          </div>

        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-zinc-500">
                Net Profit
              </p>

              <p className="text-2xl font-bold mt-2 text-green-600">
                {formatCurrency(
                  profit?.profit ?? 0
                )}
              </p>
            </div>

            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={22} />
            </div>

          </div>

        </div>

      </div>

      {/* Revenue breakdown */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <div className="bg-white border border-zinc-200 rounded-xl p-6">

          <h2 className="font-semibold">
            Sales Breakdown
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            Revenue calculation
          </p>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between">
              <span className="text-zinc-500">
                Subtotal
              </span>

              <span className="font-medium">
                {formatCurrency(
                  salesSummary?.subtotal ?? 0
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">
                Discount
              </span>

              <span className="font-medium text-red-600">
                -{" "}
                {formatCurrency(
                  salesSummary?.discount ?? 0
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">
                Tax
              </span>

              <span className="font-medium">
                {formatCurrency(
                  salesSummary?.tax ?? 0
                )}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold">
                Total Revenue
              </span>

              <span className="font-bold">
                {formatCurrency(
                  salesSummary?.revenue ?? 0
                )}
              </span>
            </div>

          </div>

        </div>

        {/* Profit */}

        <div className="bg-white border border-zinc-200 rounded-xl p-6">

          <h2 className="font-semibold">
            Profit Analysis
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            Revenue versus product cost
          </p>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between">
              <span className="text-zinc-500">
                Revenue
              </span>

              <span className="font-medium">
                {formatCurrency(
                  profit?.revenue ?? 0
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">
                Cost
              </span>

              <span className="font-medium">
                {formatCurrency(
                  profit?.cost ?? 0
                )}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold">
                Profit
              </span>

              <span className="font-bold text-green-600">
                {formatCurrency(
                  profit?.profit ?? 0
                )}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Top Products */}

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="font-semibold">
            Top Selling Products
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            Products ranked by quantity sold
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-zinc-50 border-b">

              <tr>
                <th className="text-left px-6 py-4">
                  Product
                </th>

                <th className="text-left px-6 py-4">
                  SKU
                </th>

                <th className="text-right px-6 py-4">
                  Units Sold
                </th>

                <th className="text-right px-6 py-4">
                  Revenue
                </th>
              </tr>

            </thead>

            <tbody>

              {topProducts.length === 0 ? (

                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-zinc-500"
                  >
                    No product sales found.
                  </td>
                </tr>

              ) : (

                topProducts.map((product) => (

                  <tr
                    key={product.productId}
                    className="border-b last:border-0 hover:bg-zinc-50"
                  >

                    <td className="px-6 py-4 font-medium">
                      {product.name}
                    </td>

                    <td className="px-6 py-4 text-zinc-500">
                      {product.sku}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {product.quantity}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(
                        product.revenue
                      )}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Payment methods */}

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="font-semibold">
            Payment Methods
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            Sales and revenue by payment method
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-zinc-50 border-b">

              <tr>
                <th className="text-left px-6 py-4">
                  Payment Method
                </th>

                <th className="text-right px-6 py-4">
                  Sales
                </th>

                <th className="text-right px-6 py-4">
                  Revenue
                </th>
              </tr>

            </thead>

            <tbody>

              {payments.map((payment) => (

                <tr
                  key={payment.paymentMethod}
                  className="border-b last:border-0"
                >

                  <td className="px-6 py-4 font-medium">
                    {payment.paymentMethod}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {payment.sales}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    {formatCurrency(
                      payment.revenue
                    )}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}