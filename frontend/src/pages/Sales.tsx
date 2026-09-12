import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  inventory?: {
    quantity: number;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] =
    useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "UPI" | "BANK_TRANSFER"
  >("CASH");

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch(
        "http://localhost:4000/api/products"
      );

      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      const response = await fetch(
        "http://localhost:4000/api/customers"
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch customers"
        );
      }

      setCustomers(result.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  }

  function addToCart(product: Product) {
    if (!product.inventory || product.inventory.quantity <= 0) {
      alert("Product is out of stock");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        if (
          existing.quantity >=
          product.inventory!.quantity
        ) {
          alert("Not enough stock");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          product,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(
    productId: number,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(
      (item) => item.id === productId
    );

    if (
      product?.inventory &&
      quantity > product.inventory.quantity
    ) {
      alert("Not enough stock");
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function removeFromCart(productId: number) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId
      )
    );
  }

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.product.price) * item.quantity,
    0
  );

  const total = subtotal - discount + tax;

  async function completeSale() {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (discount > subtotal) {
      alert("Discount cannot be greater than subtotal");
      return;
    }

    if (discount < 0 || tax < 0) {
      alert("Discount and tax cannot be negative");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/sales",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            // Walk-in customer = no customerId
            ...(selectedCustomerId !== null && {
              customerId: selectedCustomerId,
            }),

            paymentMethod,
            discount,
            tax,

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
          result.message || "Failed to complete sale"
        );
      }

      alert(
        `Sale completed successfully!\nInvoice: ${result.data.invoiceNumber}`
      );

      // Reset sale
      setCart([]);
      setDiscount(0);
      setTax(0);

      // Reset to Walk-in Customer
      setSelectedCustomerId(null);

      // Refresh products to get updated stock
      await fetchProducts();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to complete sale"
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading products...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Sales / POS
        </h1>

        <p className="text-zinc-500 mt-1">
          Create a new sale and manage your cart.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Products */}

        <div className="lg:col-span-2">

          <div className="bg-white rounded-xl border p-5">

            <h2 className="text-lg font-semibold mb-4">
              Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

              {products.map((product) => {

                const stock =
                  product.inventory?.quantity ?? 0;

                return (
                  <button
                    key={product.id}
                    onClick={() =>
                      addToCart(product)
                    }
                    className="text-left border rounded-lg p-4 hover:border-black transition"
                  >

                    <div className="font-semibold">
                      {product.name}
                    </div>

                    <div className="text-sm text-zinc-500">
                      {product.sku}
                    </div>

                    <div className="mt-3 font-bold">
                      ₹{Number(product.price).toFixed(2)}
                    </div>

                    <div
                      className={`text-sm mt-1 ${
                        stock <= 0
                          ? "text-red-500"
                          : stock <= 10
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      Stock: {stock}
                    </div>

                  </button>
                );
              })}

            </div>

          </div>

        </div>

        {/* Cart */}

        <div className="bg-white rounded-xl border p-5">

          <h2 className="text-lg font-semibold mb-4">
            Current Sale
          </h2>

          {/* Customer */}

          <div className="mb-5">

            <label className="text-sm font-medium">
              Customer
            </label>

            <select
              value={selectedCustomerId ?? ""}
              onChange={(e) => {
                const value = e.target.value;

                setSelectedCustomerId(
                  value ? Number(value) : null
                );
              }}
              className="w-full border rounded-lg px-3 py-2 mt-1 bg-white"
            >

              <option value="">
                Walk-in Customer
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name}
                  {customer.phone
                    ? ` — ${customer.phone}`
                    : ""}
                </option>
              ))}

            </select>

          </div>

          {cart.length === 0 ? (

            <div className="text-center py-10 text-zinc-500">
              Cart is empty
            </div>

          ) : (

            <div className="space-y-4">

              {cart.map((item) => (

                <div
                  key={item.product.id}
                  className="border-b pb-4"
                >

                  <div className="font-medium">
                    {item.product.name}
                  </div>

                  <div className="text-sm text-zinc-500">
                    ₹
                    {Number(
                      item.product.price
                    ).toFixed(2)}
                  </div>

                  <div className="flex items-center justify-between mt-2">

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1
                          )
                        }
                        className="w-7 h-7 border rounded"
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                        className="w-7 h-7 border rounded"
                      >
                        +
                      </button>

                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(
                          item.product.id
                        )
                      }
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

              <div className="space-y-2 pt-2">

                {/* Subtotal */}

                <div className="flex justify-between">
                  <span>Subtotal</span>

                  <span>
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Discount */}

                <div>

                  <label className="text-sm">
                    Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(
                        Number(e.target.value)
                      )
                    }
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                  />

                </div>

                {/* Tax */}

                <div>

                  <label className="text-sm">
                    Tax
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={tax}
                    onChange={(e) =>
                      setTax(
                        Number(e.target.value)
                      )
                    }
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                  />

                </div>

                {/* Payment */}

                <div>

                  <label className="text-sm">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as
                          | "CASH"
                          | "CARD"
                          | "UPI"
                          | "BANK_TRANSFER"
                      )
                    }
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                  >

                    <option value="CASH">
                      Cash
                    </option>

                    <option value="CARD">
                      Card
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="BANK_TRANSFER">
                      Bank Transfer
                    </option>

                  </select>

                </div>

                {/* Total */}

                <div className="border-t pt-3 flex justify-between text-lg font-bold">

                  <span>
                    Total
                  </span>

                  <span>
                    ₹{total.toFixed(2)}
                  </span>

                </div>

                {/* Complete Sale */}

                <button
                  onClick={completeSale}
                  disabled={
                    processing ||
                    cart.length === 0
                  }
                  className="w-full bg-black text-white rounded-lg py-3 mt-3 disabled:opacity-50"
                >
                  {processing
                    ? "Processing..."
                    : "Complete Sale"}
                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}