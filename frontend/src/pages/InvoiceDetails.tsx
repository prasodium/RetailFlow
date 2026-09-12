import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  email?: string | null;
  phone?: string | null;
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
  orderStatus: string | null;
  shippingAddress: string | null;
  createdAt: string;
  customer: Customer | null;
  items: SaleItem[];
}

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSale();
  }, [id]);

  async function fetchSale() {
    try {
      const response = await api.get(`/sales/${id}`);

      if (response.data.success) {
        setSale(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch invoice", error);
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
        Loading invoice...
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">
          Invoice not found
        </h1>

        <button
          onClick={() => navigate("/sales/history")}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
        >
          Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <button
            onClick={() => navigate("/sales/history")}
            className="text-sm text-zinc-500 hover:text-black mb-2"
          >
            ← Back to Sales
          </button>

          <h1 className="text-2xl font-bold">
            Invoice
          </h1>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          Print Invoice
        </button>

      </div>

      {/* Invoice */}

      <div className="bg-white border rounded-xl p-8 max-w-4xl">

        {/* Invoice Header */}

        <div className="flex justify-between border-b pb-6">

          <div>
            <h2 className="text-2xl font-bold">
              RetailFlow
            </h2>

            <p className="text-zinc-500 mt-1">
              Retail Sales & Inventory Platform
            </p>
          </div>

          <div className="text-right">

            <h3 className="text-xl font-bold">
              {sale.invoiceNumber}
            </h3>

            <p className="text-sm text-zinc-500">
              {formatDate(sale.createdAt)}
            </p>

          </div>

        </div>

        {/* Customer */}

        <div className="py-6 border-b">

          <h3 className="font-semibold mb-2">
            Customer
          </h3>

          {sale.customer ? (
            <div>
              <p>{sale.customer.name}</p>

              {sale.customer.email && (
                <p className="text-sm text-zinc-500">
                  {sale.customer.email}
                </p>
              )}

              {sale.customer.phone && (
                <p className="text-sm text-zinc-500">
                  {sale.customer.phone}
                </p>
              )}
            </div>
          ) : (
            <p className="text-zinc-500">
              Walk-in Customer
            </p>
          )}

        </div>

        {/* Items */}

        <div className="py-6">

          <table className="w-full">

            <thead className="border-b">

              <tr>

                <th className="text-left py-3">
                  Product
                </th>

                <th className="text-left py-3">
                  SKU
                </th>

                <th className="text-right py-3">
                  Qty
                </th>

                <th className="text-right py-3">
                  Unit Price
                </th>

                <th className="text-right py-3">
                  Subtotal
                </th>

              </tr>

            </thead>

            <tbody>

              {sale.items.map((item) => (

                <tr
                  key={item.id}
                  className="border-b"
                >

                  <td className="py-4">
                    {item.product.name}
                  </td>

                  <td className="py-4 text-zinc-500">
                    {item.product.sku}
                  </td>

                  <td className="py-4 text-right">
                    {item.quantity}
                  </td>

                  <td className="py-4 text-right">
                    ₹
                    {Number(
                      item.unitPrice
                    ).toFixed(2)}
                  </td>

                  <td className="py-4 text-right font-medium">
                    ₹
                    {Number(
                      item.subtotal
                    ).toFixed(2)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Summary */}

        <div className="border-t pt-6">

          <div className="ml-auto max-w-xs space-y-3">

            <div className="flex justify-between">
              <span>Subtotal</span>

              <span>
                ₹
                {Number(
                  sale.subtotal
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>

              <span>
                ₹
                {Number(
                  sale.discount
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>

              <span>
                ₹
                {Number(
                  sale.tax
                ).toFixed(2)}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between text-lg font-bold">

              <span>Total</span>

              <span>
                ₹
                {Number(
                  sale.total
                ).toFixed(2)}
              </span>

            </div>

          </div>

        </div>

        {/* Payment */}

        <div className="border-t mt-6 pt-6 flex justify-between">

          <div>

            <p className="text-sm text-zinc-500">
              Payment Method
            </p>

            <p className="font-medium">
              {sale.paymentMethod}
            </p>

          </div>

          <div className="text-right">

            <p className="text-sm text-zinc-500">
              Status
            </p>

            <p className="font-medium text-green-600">
              {sale.status}
            </p>

          </div>

        </div>

        {sale.source === "ONLINE" && (
          <div className="border-t mt-6 pt-6 flex justify-between">

            <div>
              <p className="text-sm text-zinc-500">
                Shipping Address
              </p>

              <p className="font-medium">
                {sale.shippingAddress || "—"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-zinc-500">
                Fulfillment Status
              </p>

              <p className="font-medium text-blue-600">
                {sale.orderStatus ?? "PENDING"}
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}