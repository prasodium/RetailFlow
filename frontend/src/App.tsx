import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import InventoryPage from "./pages/InventoryPage";
import Sales from "./pages/Sales";
import SalesHistory from "./pages/SalesHistory";
import InvoiceDetails from "./pages/InvoiceDetails";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";

function Placeholder({
  title,
}: {
  title: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-2 text-zinc-500">
        This module will be implemented next.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Products */}
          <Route
            path="/products"
            element={<Products />}
          />

          {/* Inventory */}
          <Route
            path="/inventory"
            element={<InventoryPage />}
          />

          {/* Sales */}
         <Route
          path="/sales"
          element={<Sales />}
          />
          <Route
            path="/sales/history"
            element={<SalesHistory />}
          />
          <Route
            path="/sales/:id"
            element={<InvoiceDetails />}
          />
          {/* Customers */}
            <Route
              path="/customers"
              element={<Customers />}
            />
          {/* Categories */}
          <Route
            path="/categories"
            element={<Categories />}
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}