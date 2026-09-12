import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import InventoryPage from "./pages/InventoryPage";
import Sales from "./pages/Sales";
import SalesHistory from "./pages/SalesHistory";
import InvoiceDetails from "./pages/InvoiceDetails";
import OnlineOrders from "./pages/OnlineOrders";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
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

              {/* Online Orders */}
              <Route
                path="/orders"
                element={<OnlineOrders />}
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
