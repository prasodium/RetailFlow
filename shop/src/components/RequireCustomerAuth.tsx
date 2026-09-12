import { Navigate, Outlet } from "react-router-dom";
import { useShopAuth } from "../context/ShopAuthContext";

export default function RequireCustomerAuth() {
  const { token } = useShopAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
