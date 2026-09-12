import api from "./api";
import type { Sale, OrderStatus } from "../types";

export async function getOnlineOrders(): Promise<Sale[]> {
  const response = await api.get("/sales", {
    params: { source: "ONLINE" },
  });

  return response.data.data;
}

export async function updateOrderStatus(
  id: number,
  orderStatus: OrderStatus
): Promise<Sale> {
  const response = await api.patch(`/sales/${id}/order-status`, {
    orderStatus,
  });

  return response.data.data;
}
