import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Warehouse,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";

interface InventoryStats {
  totalProducts: number;
  totalUnits: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

interface LowStockProduct {
  id: number;
  quantity: number;
  minStock: number;
  product: {
    id: number;
    name: string;
    sku: string;
  };
}

interface Sale {
  id: number;
  invoiceNumber: string;
  total: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalUnits: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const [
        statsResponse,
        salesResponse,
        lowStockResponse,
      ] = await Promise.all([
        fetch("http://localhost:4000/api/inventory/stats"),
        fetch("http://localhost:4000/api/sales"),
        fetch("http://localhost:4000/api/inventory/low-stock"),
      ]);

      const statsResult = await statsResponse.json();
      const salesResult = await salesResponse.json();
      const lowStockResult = await lowStockResponse.json();

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (salesResult.success) {
        setSales(salesResult.data);
      }

      if (lowStockResult.success) {
        setLowStock(lowStockResult.data);
      }
    } catch (error) {
      console.error(
        "Failed to load dashboard",
        error
      );
    } finally {
      setLoading(false);
    }
  }
    const completedSales = sales.filter(
    (sale) => sale.status === "COMPLETED"
    );

    const totalSales = completedSales.length;

    const revenue = completedSales.reduce(
    (total, sale) =>
        total + Number(sale.total),
    0
    );

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading dashboard...
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: "Stock Items",
      value: stats.totalUnits,
      icon: Warehouse,
    },
    {
      title: "Total Sales",
      value: totalSales,
      icon: ShoppingCart,
    },
    {
      title: "Revenue",
      value: `₹${revenue.toFixed(2)}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h2 className="text-2xl font-bold text-zinc-900">
          Dashboard
        </h2>

        <p className="text-sm text-zinc-500 mt-1">
          Overview of your retail business
        </p>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {dashboardStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
            key={stat.title}
            onClick={() => {
                if (stat.title === "Total Products") {
                navigate("/products");
                }

                if (stat.title === "Stock Items") {
                navigate("/inventory");
                }

                if (stat.title === "Total Sales") {
                navigate("/sales");
                }

                if (stat.title === "Revenue") {
                navigate("/reports");
                }
            }}
            className="bg-white rounded-xl border border-zinc-200 p-5 cursor-pointer hover:shadow-sm hover:border-zinc-300 transition"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-zinc-500">
                    {stat.title}
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    {stat.value}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Icon size={22} />
                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Main sections */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Sales */}

        <div className="bg-white rounded-xl border border-zinc-200 p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h3 className="font-semibold">
                Recent Sales
              </h3>

              <p className="text-sm text-zinc-500">
                Latest transactions
              </p>
            </div>

          </div>

          {sales.length === 0 ? (

            <div className="text-center py-12 text-zinc-400">
              No sales found.
            </div>

          ) : (

            <div className="space-y-3">

              {sales.slice(0, 5).map((sale) => (

                <div
                  key={sale.id}
                  className="flex items-center justify-between border-t pt-4"
                >

                  <div>
                    <p className="font-medium">
                      {sale.invoiceNumber}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {formatDate(sale.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-semibold">
                      ₹{Number(sale.total).toFixed(2)}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {sale.paymentMethod}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Low Stock */}

        <div className="bg-white rounded-xl border border-zinc-200 p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h3 className="font-semibold">
                Low Stock Alert
              </h3>

              <p className="text-sm text-zinc-500">
                Products that need attention
              </p>
            </div>

          </div>

          {lowStock.length === 0 ? (

            <div className="text-center py-12 text-zinc-400">
              All products have sufficient stock.
            </div>

          ) : (

            <div className="space-y-3">

              {lowStock.slice(0, 5).map((item) => (

                    <div
                    key={item.id}
                    onClick={() =>
                        navigate(`/inventory?productId=${item.product.id}`)
                    }
                    className="flex items-center justify-between py-4 border-t cursor-pointer hover:bg-zinc-50 transition"
                    >

                  <div>
                    <p className="font-medium">
                      {item.product.name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {item.product.sku}
                    </p>
                  </div>

                  <div className="text-right">

                    <p
                      className={
                        item.quantity === 0
                          ? "text-red-700 font-semibold"
                          : "text-orange-600 font-semibold"
                      }
                    >
                      {item.quantity} left
                    </p>

                    <p className="text-xs text-zinc-400">
                      Minimum: {item.minStock}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}