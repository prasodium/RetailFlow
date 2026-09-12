import { useEffect, useState } from "react";
import api from "../services/api";

interface Product {
  id: number;
  name: string;
  sku: string;
}

interface SaleItem {
  id: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: Product;
}

interface Customer {
  id: number;
  name: string;
}

interface Sale {
  id: number;
  invoiceNumber: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentMethod: string;
  status: string;
  source: "POS" | "ONLINE";
  createdAt: string;
  customer: Customer | null;
  items: SaleItem[];
}

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      const response = await api.get("/sales");

      if (response.data.success) {
        setSales(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch sales", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading sales...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Sales History
        </h1>

        <p className="text-zinc-500 mt-1">
          View all completed sales and invoices.
        </p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-zinc-50 border-b">

              <tr>
                <th className="text-left px-5 py-4">
                  Invoice
                </th>

                <th className="text-left px-5 py-4">
                  Date
                </th>

                <th className="text-left px-5 py-4">
                  Items
                </th>

                <th className="text-left px-5 py-4">
                  Payment
                </th>

                <th className="text-left px-5 py-4">
                  Source
                </th>

                <th className="text-left px-5 py-4">
                  Status
                </th>

                <th className="text-right px-5 py-4">
                  Total
                </th>
              </tr>

            </thead>

            <tbody>

              {sales.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-zinc-500"
                  >
                    No sales found.
                  </td>
                </tr>

              ) : (

                sales.map((sale) => (

                  <tr
                    key={sale.id}
                    className="border-b last:border-0 hover:bg-zinc-50"
                  >

                    <td className="px-5 py-4 font-medium">
                    <a
                        href={`/sales/${sale.id}`}
                        className="text-blue-600 hover:underline"
                    >
                        {sale.invoiceNumber}
                    </a>
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {formatDate(sale.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      {sale.items.reduce(
                        (total, item) =>
                          total + item.quantity,
                        0
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2 py-1 rounded-md bg-zinc-100">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          sale.source === "ONLINE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {sale.source === "ONLINE" ? "Online" : "In-Store"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2 py-1 rounded-md bg-green-100 text-green-700">
                        {sale.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right font-semibold">
                      ₹{Number(sale.total).toFixed(2)}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}