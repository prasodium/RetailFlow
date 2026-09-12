import { useEffect, useState } from "react";
import api from "../services/api";

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const response = await api.get("/customers");

      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingCustomer(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setShowModal(true);
  }

  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
  }

  async function saveCustomer() {
    if (!form.name.trim()) {
      alert("Customer name is required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      };

      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post("/customers", payload);
      }

      setShowModal(false);
      setEditingCustomer(null);

      await fetchCustomers();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message || "Failed to save customer"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/customers/${customer.id}`);

      await fetchCustomers();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message || "Failed to delete customer"
      );
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        Loading customers...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold">
            Customers
          </h1>

          <p className="text-zinc-500 mt-1">
            Manage your customers and their information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-black text-white px-4 py-2.5 rounded-lg hover:bg-zinc-800"
        >
          + Add Customer
        </button>

      </div>

      {/* Search */}

      <div className="bg-white border rounded-xl p-4">

        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-300"
        />

      </div>

      {/* Customer table */}

      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-zinc-50 border-b">

              <tr>
                <th className="text-left px-5 py-4">
                  Name
                </th>

                <th className="text-left px-5 py-4">
                  Phone
                </th>

                <th className="text-left px-5 py-4">
                  Email
                </th>

                <th className="text-left px-5 py-4">
                  Address
                </th>

                <th className="text-right px-5 py-4">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody>

              {filteredCustomers.length === 0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-zinc-500"
                  >
                    {search
                      ? "No customers found."
                      : "No customers yet."}
                  </td>
                </tr>

              ) : (

                filteredCustomers.map((customer) => (

                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-zinc-50"
                  >

                    <td className="px-5 py-4 font-medium">
                      {customer.name}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {customer.phone || "—"}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {customer.email || "—"}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {customer.address || "—"}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditModal(customer)
                          }
                          className="px-3 py-1.5 border rounded-lg hover:bg-zinc-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteCustomer(customer)
                          }
                          className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl w-full max-w-lg p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-semibold">
                {editingCustomer
                  ? "Edit Customer"
                  : "Add Customer"}
              </h2>

              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-black text-xl"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              {/* Name */}

              <div>
                <label className="text-sm font-medium">
                  Name *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Customer name"
                />
              </div>

              {/* Phone */}

              <div>
                <label className="text-sm font-medium">
                  Phone
                </label>

                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Phone number"
                />
              </div>

              {/* Email */}

              <div>
                <label className="text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Email address"
                />
              </div>

              {/* Address */}

              <div>
                <label className="text-sm font-medium">
                  Address
                </label>

                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Customer address"
                  rows={3}
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={saveCustomer}
                disabled={saving}
                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingCustomer
                  ? "Update Customer"
                  : "Add Customer"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}