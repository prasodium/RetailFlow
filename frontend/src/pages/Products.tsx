import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  ImagePlus,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  type Product,
  type CreateProductInput,
} from "../services/productService";

import {
  getCategories,
  type Category,
} from "../services/categoryService";

import { resolveImageUrl } from "../lib/assets";

export default function Products() {
  // ============================================================
  // STATE
  // ============================================================

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateProductInput>({
    name: "",
    sku: "",
    description: "",
    price: 0,
    costPrice: 0,
    categoryId: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  function triggerImageUpload(productId: number) {
    setUploadTargetId(productId);
    fileInputRef.current?.click();
  }

  async function handleImageSelected(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || uploadTargetId === null) {
      return;
    }

    try {
      setUploadingId(uploadTargetId);

      await uploadProductImage(uploadTargetId, file);

      await loadProducts();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message || "Failed to upload image"
      );
    } finally {
      setUploadingId(null);
      setUploadTargetId(null);
    }
  }

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  async function loadProducts() {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  async function loadCategories() {
    try {
      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // ============================================================
  // CREATE / UPDATE PRODUCT
  // ============================================================

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingProduct) {
        await updateProduct(editingProduct.id, form);
      } else {
        await createProduct(form);
      }

      setShowAddModal(false);
      setEditingProduct(null);

      setForm({
        name: "",
        sku: "",
        description: "",
        price: 0,
        costPrice: 0,
        categoryId: 0,
      });

      await loadProducts();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          `Failed to ${
            editingProduct ? "update" : "create"
          } product`
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // EDIT PRODUCT
  // ============================================================

  function handleEditProduct(product: Product) {
    setEditingProduct(product);

    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description ?? "",
      price: Number(product.price),
      costPrice: Number(product.costPrice),
      categoryId: product.categoryId,
    });

    setError("");
    setShowAddModal(true);
  }

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(product.id);

      await loadProducts();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete product"
      );
    }
  }

  // ============================================================
  // OPEN ADD PRODUCT MODAL
  // ============================================================

  function handleAddProduct() {
    setEditingProduct(null);
    setError("");

    setForm({
      name: "",
      sku: "",
      description: "",
      price: 0,
      costPrice: 0,
      categoryId: 0,
    });

    setShowAddModal(true);
  }

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  function handleCloseModal() {
    setShowAddModal(false);
    setEditingProduct(null);
    setError("");
  }

  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.category.name.toLowerCase().includes(query)
    );
  });

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageSelected}
      />

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your products and inventory
          </p>
        </div>

        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* ========================================================
          SEARCH
      ======================================================== */}

      <div className="bg-white border rounded-xl p-4">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ========================================================
          PRODUCT TABLE
      ======================================================== */}

      <div className="bg-white border rounded-xl overflow-hidden">

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <table className="w-full">

            {/* TABLE HEADER */}

            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4">
                  Image
                </th>

                <th className="text-left px-6 py-4">
                  Product
                </th>

                <th className="text-left px-6 py-4">
                  SKU
                </th>

                <th className="text-left px-6 py-4">
                  Category
                </th>

                <th className="text-left px-6 py-4">
                  Price
                </th>

                <th className="text-left px-6 py-4">
                  Cost
                </th>

                <th className="text-left px-6 py-4">
                  Stock
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>

                <th className="text-left px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}

            <tbody className="divide-y">

              {filteredProducts.map((product) => {
                const stock =
                  product.inventory?.quantity ?? 0;

                const minStock =
                  product.inventory?.minStock ?? 0;

                const isOutOfStock = stock === 0;

                const isLowStock =
                  stock > 0 && stock <= minStock;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >

                    {/* IMAGE */}

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          triggerImageUpload(product.id)
                        }
                        title="Upload image"
                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center hover:border-blue-400"
                      >
                        {resolveImageUrl(product.imageUrl) ? (
                          <img
                            src={resolveImageUrl(product.imageUrl)!}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImagePlus
                            size={18}
                            className="text-gray-400"
                          />
                        )}

                        {uploadingId === product.id && (
                          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] font-medium text-gray-600">
                            ...
                          </span>
                        )}
                      </button>
                    </td>

                    {/* PRODUCT */}

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {product.name}
                      </div>

                      {product.description && (
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                      )}
                    </td>

                    {/* SKU */}

                    <td className="px-6 py-4 text-gray-600">
                      {product.sku}
                    </td>

                    {/* CATEGORY */}

                    <td className="px-6 py-4 text-gray-600">
                      {product.category.name}
                    </td>

                    {/* PRICE */}

                    <td className="px-6 py-4 font-medium">
                      ₹{Number(product.price).toLocaleString()}
                    </td>

                    {/* COST */}

                    <td className="px-6 py-4 text-gray-600">
                      ₹{Number(product.costPrice).toLocaleString()}
                    </td>

                    {/* STOCK */}

                    <td className="px-6 py-4 font-medium">
                      {stock}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-700">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEditProduct(product)
                          }
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                          title="Edit product"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProduct(product)
                          }
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                          title="Delete product"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>
        )}

      </div>

      {/* ========================================================
          ADD / EDIT PRODUCT MODAL
      ======================================================== */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-semibold">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {editingProduct
                    ? "Update the product information"
                    : "Add a new product to your inventory"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>

            </div>

            {/* ==================================================
                PRODUCT FORM
            ================================================== */}

            <form
              onSubmit={handleCreateProduct}
              className="space-y-4"
            >

              {/* PRODUCT NAME */}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="ESP32 DevKit V1"
                />
              </div>

              {/* SKU */}

              <div>
                <label className="block text-sm font-medium mb-1">
                  SKU
                </label>

                <input
                  required
                  value={form.sku}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sku: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="ESP32-DEV-V1"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Product description"
                />
              </div>

              {/* PRICE */}

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Selling Price
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cost Price
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        costPrice: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

              </div>

              {/* CATEGORY */}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>

                <select
                  required
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoryId: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value={0} disabled>
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-1">
                  Select the category for this product.
                </p>
              </div>

              {/* ERROR */}

              {error && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}