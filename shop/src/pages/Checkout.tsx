import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
} from "lucide-react";

import type { CartItem } from "../types";

interface CheckoutProps {
  cart: CartItem[];
  onClearCart: () => void;
}

export default function Checkout({
  cart,
  onClearCart,
}: CheckoutProps) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<
      "CASH" | "CARD" | "UPI" | "BANK_TRANSFER"
    >("UPI");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.product.price) * item.quantity,
    0
  );

  async function handlePlaceOrder(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
       * For now, the online customer is not linked
       * to a Customer record.
       *
       * We will add customer creation/linking next.
       */

      const response = await fetch(
        "http://localhost:4000/api/sales",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
        customer: {
            name: name.trim(),
            email: email.trim() || undefined,
            phone: phone.trim(),
            address: address.trim(),
        },

        paymentMethod,

        discount: 0,

        tax: 0,

        items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
        })),
        }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to place order"
        );
      }

      /*
       * Store order information temporarily so
       * the success page can display it.
       */

      sessionStorage.setItem(
        "retailflow-last-order",
        JSON.stringify(result.data)
      );

      onClearCart();

      navigate("/order-success");
    } catch (error) {
      console.error(
        "Checkout failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">

        <h1 className="text-2xl font-bold">
          Your cart is empty
        </h1>

        <p className="text-zinc-500 mt-2">
          Add products before checking out.
        </p>

        <Link
          to="/products"
          className="inline-block mt-6 px-5 py-3 bg-blue-600 text-white rounded-xl"
        >
          Browse Products
        </Link>

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 mb-8"
      >
        <ArrowLeft size={16} />
        Back to cart
      </Link>

      <h1 className="text-3xl font-bold">
        Checkout
      </h1>

      <p className="text-zinc-500 mt-2">
        Complete your order details.
      </p>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">

        {/* Customer information */}

        <form
          onSubmit={handlePlaceOrder}
          className="lg:col-span-2 space-y-6"
        >

          <div className="bg-white border rounded-2xl p-6">

            <h2 className="text-lg font-semibold">
              Customer Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5 mt-6">

              <div>

                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Your name"
                  className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div>

                <label className="block text-sm font-medium mb-2">
                  Phone *
                </label>

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Phone number"
                  className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="md:col-span-2">

                <label className="block text-sm font-medium mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="md:col-span-2">

                <label className="block text-sm font-medium mb-2">
                  Delivery Address *
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="Enter your complete address"
                  rows={4}
                  className="w-full border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

              </div>

            </div>

          </div>

          {/* Payment */}

          <div className="bg-white border rounded-2xl p-6">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Payment Method
                </h2>

                <p className="text-sm text-zinc-500">
                  Select how you want to pay.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

              {[
                ["UPI", "UPI"],
                ["CARD", "Card"],
                ["CASH", "Cash"],
                [
                  "BANK_TRANSFER",
                  "Bank Transfer",
                ],
              ].map(([value, label]) => (

                <button
                  type="button"
                  key={value}
                  onClick={() =>
                    setPaymentMethod(
                      value as typeof paymentMethod
                    )
                  }
                  className={`border rounded-xl p-4 text-sm font-medium transition ${
                    paymentMethod === value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {label}
                </button>

              ))}

            </div>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing Order..."
              : "Place Order"}
          </button>

        </form>

        {/* Order summary */}

        <div className="bg-white border rounded-2xl p-6 h-fit">

          <h2 className="font-semibold text-lg">
            Order Summary
          </h2>

          <div className="space-y-4 mt-6">

            {cart.map((item) => (

              <div
                key={item.product.id}
                className="flex justify-between gap-4"
              >

                <div>

                  <p className="font-medium text-sm">
                    {item.product.name}
                  </p>

                  <p className="text-xs text-zinc-500">
                    Qty: {item.quantity}
                  </p>

                </div>

                <p className="font-medium text-sm">
                  ₹
                  {(
                    Number(
                      item.product.price
                    ) * item.quantity
                  ).toFixed(2)}
                </p>

              </div>

            ))}

          </div>

          <div className="border-t mt-6 pt-5">

            <div className="flex justify-between">
              <span className="text-zinc-500">
                Subtotal
              </span>

              <span>
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between mt-3">
              <span className="text-zinc-500">
                Shipping
              </span>

              <span>
                Free
              </span>
            </div>

            <div className="border-t mt-5 pt-5 flex justify-between text-lg font-bold">

              <span>Total</span>

              <span>
                ₹{subtotal.toFixed(2)}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}