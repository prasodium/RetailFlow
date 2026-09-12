import { useEffect, useState } from "react";
import { Plus, Folder, X } from "lucide-react";
import api from "../services/api";

interface Category {
  id: number;
  name: string;
  description: string | null;
  _count?: {
    products: number;
  };
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);

      const response = await api.get("/categories");

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/categories", {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setCategories((current) =>
        [...current, response.data.data].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      setName("");
      setDescription("");
      setShowModal(false);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Failed to create category"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Categories
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            Organize your products into categories.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Category
        </button>

      </div>

      {/* Error */}

      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}

      {loading ? (

        <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center text-zinc-500">
          Loading categories...
        </div>

      ) : categories.length === 0 ? (

        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">

          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Folder size={22} />
          </div>

          <h3 className="font-semibold mt-4">
            No categories yet
          </h3>

          <p className="text-sm text-zinc-500 mt-1">
            Create your first category to organize products.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Category
          </button>

        </div>

      ) : (

        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-zinc-50 border-b">

                <tr>

                  <th className="text-left px-5 py-4">
                    Category
                  </th>

                  <th className="text-left px-5 py-4">
                    Description
                  </th>

                  <th className="text-right px-5 py-4">
                    Products
                  </th>

                </tr>

              </thead>

              <tbody>

                {categories.map((category) => (

                  <tr
                    key={category.id}
                    className="border-b last:border-0 hover:bg-zinc-50"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Folder size={18} />
                        </div>

                        <div>
                          <p className="font-medium">
                            {category.name}
                          </p>

                          <p className="text-xs text-zinc-400">
                            ID #{category.id}
                          </p>
                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {category.description || "—"}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {category._count?.products ?? 0}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* Add Category Modal */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div>
                <h2 className="text-lg font-semibold">
                  Add Category
                </h2>

                <p className="text-sm text-zinc-500">
                  Create a new product category.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-zinc-100"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleCreateCategory}
              className="p-6 space-y-5"
            >

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Category Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. Microcontrollers"
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />

              </div>

              <div>

                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Category description..."
                  rows={3}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-zinc-300 rounded-lg hover:bg-zinc-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}