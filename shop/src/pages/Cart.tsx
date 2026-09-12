import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { CartItem } from "../types";

interface CartProps {
  cart: CartItem[];

  onUpdateQuantity: (
    productId: number,
    quantity: number
  ) => void;

  onRemove: (
    productId: number
  ) => void;
}

export default function Cart({
  cart,
  onUpdateQuantity,
  onRemove,
}: CartProps) {

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.product.price) *
        item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">

        <ShoppingBag
          size={55}
          className="mx-auto text-zinc-300"
        />

        <h1 className="text-2xl font-bold mt-5">
          Your cart is empty
        </h1>

        <p className="text-zinc-500 mt-2">
          Add some products to get started.
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

      <h1 className="text-3xl font-bold">
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">

        <div className="lg:col-span-2 space-y-4">

          {cart.map((item) => {

            const stock =
              item.product.inventory
                ?.quantity ?? 0;

            return (
              <div
                key={item.product.id}
                className="bg-white border rounded-2xl p-5 flex gap-5"
              >

                <div className="w-24 h-24 bg-zinc-100 rounded-xl flex items-center justify-center text-3xl font-bold text-zinc-400">
                  {item.product.name
                    .substring(0, 1)
                    .toUpperCase()}
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold">
                    {item.product.name}
                  </h3>

                  <p className="text-sm text-zinc-500">
                    {item.product.sku}
                  </p>

                  <p className="font-semibold mt-2">
                    ₹
                    {Number(
                      item.product.price
                    ).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-4 mt-4">

                    <div className="flex items-center border rounded-lg">

                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            Math.max(
                              1,
                              item.quantity - 1
                            )
                          )
                        }
                        className="p-2"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            Math.min(
                              stock,
                              item.quantity + 1
                            )
                          )
                        }
                        className="p-2"
                      >
                        <Plus size={15} />
                      </button>

                    </div>

                    <button
                      onClick={() =>
                        onRemove(
                          item.product.id
                        )
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>

                <div className="font-bold">
                  ₹
                  {(
                    Number(
                      item.product.price
                    ) *
                    item.quantity
                  ).toFixed(2)}
                </div>

              </div>
            );
          })}

        </div>

        <div className="bg-white border rounded-2xl p-6 h-fit">

          <h2 className="font-semibold text-lg">
            Order Summary
          </h2>

          <div className="flex justify-between mt-6 text-zinc-600">
            <span>Subtotal</span>
            <span>
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between mt-3 text-zinc-500">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="border-t mt-6 pt-5 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          <Link
            to="/checkout"
            className="block text-center mt-6 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700"
          >
            Proceed to Checkout
          </Link>

        </div>

      </div>

    </div>
  );
}