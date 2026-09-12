import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrderSuccess() {
  const savedOrder =
    sessionStorage.getItem(
      "retailflow-last-order"
    );

  const order = savedOrder
    ? JSON.parse(savedOrder)
    : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">

      <div className="w-20 h-20 mx-auto rounded-full bg-green-50 text-green-600 flex items-center justify-center">
        <CheckCircle size={42} />
      </div>

      <h1 className="text-3xl font-bold mt-6">
        Order Placed Successfully!
      </h1>

      <p className="text-zinc-500 mt-3">
        Thank you for your purchase.
      </p>

      {order && (
        <div className="bg-white border rounded-2xl p-6 mt-8 text-left">

          <div className="flex justify-between">
            <span className="text-zinc-500">
              Invoice
            </span>

            <span className="font-semibold">
              {order.invoiceNumber}
            </span>
          </div>

          <div className="flex justify-between mt-4">
            <span className="text-zinc-500">
              Payment
            </span>

            <span className="font-medium">
              {order.paymentMethod}
            </span>
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t">

            <span className="font-semibold">
              Total
            </span>

            <span className="font-bold text-lg">
              ₹{Number(order.total).toFixed(2)}
            </span>

          </div>

        </div>
      )}

      <div className="flex justify-center gap-3 mt-8">

        <Link
          to="/products"
          className="px-5 py-3 border rounded-xl hover:bg-zinc-50"
        >
          Continue Shopping
        </Link>

        <Link
          to="/"
          className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Back to Store
        </Link>

      </div>

    </div>
  );
}