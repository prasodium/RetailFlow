import { useEffect, useState } from "react";

import {
  getInventory,
  getInventoryStats,
  getLowStockInventory,
  stockIn,
  stockOut,
  type Inventory,
  type InventoryStats,
} from "../services/inventoryService";

type StockAction = "IN" | "OUT";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [lowStock, setLowStock] = useState<Inventory[]>([]);

  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalUnits: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<StockAction>("IN");
  const [selectedProductId, setSelectedProductId] =
    useState<number | null>(null);

  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  async function loadInventory() {
    try {
      setLoading(true);
      setError("");

      const [
        inventoryData,
        statsData,
        lowStockData,
      ] = await Promise.all([
        getInventory(),
        getInventoryStats(),
        getLowStockInventory(),
      ]);

      setInventory(inventoryData);
      setStats(statsData);
      setLowStock(lowStockData);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  function openStockModal(
    type: StockAction,
    productId?: number
  ) {
    setAction(type);
    setSelectedProductId(productId ?? null);
    setQuantity("");
    setNote("");
    setActionError("");
    setShowModal(true);
  }

  function closeStockModal() {
    if (submitting) return;

    setShowModal(false);
    setSelectedProductId(null);
    setQuantity("");
    setNote("");
    setActionError("");
  }

  async function handleStockSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setActionError("");

    if (!selectedProductId) {
      setActionError("Please select a product.");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setActionError(
        "Quantity must be a positive whole number."
      );
      return;
    }

    const selectedInventory = inventory.find(
      (item) =>
        item.productId === selectedProductId
    );

    if (!selectedInventory) {
      setActionError("Inventory not found.");
      return;
    }

    if (
      action === "OUT" &&
      parsedQuantity > selectedInventory.quantity
    ) {
      setActionError(
        `Only ${selectedInventory.quantity} units are available.`
      );
      return;
    }

    try {
      setSubmitting(true);

      if (action === "IN") {
        await stockIn(
          selectedProductId,
          parsedQuantity,
          note.trim() || undefined
        );
      } else {
        await stockOut(
          selectedProductId,
          parsedQuantity,
          note.trim() || undefined
        );
      }

      closeStockModal();

      await loadInventory();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        "Failed to update stock.";

      setActionError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>

        <button
          onClick={loadInventory}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage your stock levels
          </p>
        </div>

        <button
          onClick={() => openStockModal("IN")}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          + Stock In
        </button>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Products
          </p>

          <p className="mt-2 text-3xl font-bold">
            {stats.totalProducts}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Units
          </p>

          <p className="mt-2 text-3xl font-bold">
            {stats.totalUnits}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {stats.lowStockProducts}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Out of Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {stats.outOfStockProducts}
          </p>
        </div>

      </div>

      {/* Low Stock Alerts */}
      <div className="rounded-xl border bg-white shadow-sm">

        <div className="flex items-center justify-between border-b p-5">

          <div>
            <h2 className="text-lg font-semibold">
              Low Stock Alerts
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Products that need attention
            </p>
          </div>

        </div>

        {lowStock.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No low-stock products.
          </div>
        ) : (
          <div className="divide-y">

            {lowStock.map((item) => {
              const outOfStock =
                item.quantity === 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5"
                >

                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      SKU: {item.product.sku}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">

                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          outOfStock
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {item.quantity} units
                      </p>

                      <p className="text-xs text-gray-500">
                        Minimum: {item.minStock}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        openStockModal(
                          "IN",
                          item.productId
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                    >
                      Restock
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border bg-white shadow-sm">

        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Inventory
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current stock levels
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b bg-gray-50">

              <tr>
                <th className="px-5 py-3 font-medium">
                  Product
                </th>

                <th className="px-5 py-3 font-medium">
                  SKU
                </th>

                <th className="px-5 py-3 font-medium">
                  Category
                </th>

                <th className="px-5 py-3 font-medium">
                  Stock
                </th>

                <th className="px-5 py-3 font-medium">
                  Minimum
                </th>

                <th className="px-5 py-3 font-medium">
                  Status
                </th>

                <th className="px-5 py-3 font-medium">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y">

              {inventory.map((item) => {

                const outOfStock =
                  item.quantity === 0;

                const lowStock =
                  item.quantity <= item.minStock;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">
                      <div className="font-medium">
                        {item.product.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        {item.product.description}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {item.product.sku}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {item.product.category?.name ??
                        "Uncategorized"}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {item.quantity}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {item.minStock}
                    </td>

                    <td className="px-5 py-4">

                      {outOfStock ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Out of Stock
                        </span>
                      ) : lowStock ? (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          In Stock
                        </span>
                      )}

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            openStockModal(
                              "IN",
                              item.productId
                            )
                          }
                          className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                        >
                          Stock In
                        </button>

                        <button
                          onClick={() =>
                            openStockModal(
                              "OUT",
                              item.productId
                            )
                          }
                          disabled={item.quantity === 0}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Stock Out
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* Stock Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-5">

              <div>
                <h2 className="text-lg font-semibold">
                  {action === "IN"
                    ? "Stock In"
                    : "Stock Out"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {action === "IN"
                    ? "Add inventory to a product"
                    : "Remove inventory from a product"}
                </p>
              </div>

              <button
                onClick={closeStockModal}
                disabled={submitting}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleStockSubmit}
              className="space-y-5 p-5"
            >

              {/* Product */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Product
                </label>

                <select
                  value={
                    selectedProductId ?? ""
                  }
                  onChange={(event) =>
                    setSelectedProductId(
                      Number(event.target.value)
                    )
                  }
                  disabled={submitting}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
                >

                  <option value="">
                    Select a product
                  </option>

                  {inventory.map((item) => (
                    <option
                      key={item.productId}
                      value={item.productId}
                    >
                      {item.product.name} —{" "}
                      {item.quantity} available
                    </option>
                  ))}

                </select>

              </div>

              {/* Quantity */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  disabled={submitting}
                  placeholder="Enter quantity"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
                />

              </div>

              {/* Note */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Note
                  <span className="ml-1 text-gray-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  disabled={submitting}
                  rows={3}
                  placeholder={
                    action === "IN"
                      ? "e.g. New stock received"
                      : "e.g. Damaged item"
                  }
                  className="w-full resize-none rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
                />

              </div>

              {/* Error */}
              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={submitting}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    action === "IN"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {submitting
                    ? "Updating..."
                    : action === "IN"
                    ? "Add Stock"
                    : "Remove Stock"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}