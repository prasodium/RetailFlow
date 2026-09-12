import api from "./api";

export interface InventoryProduct {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  costPrice: string;
  categoryId: number;

  category: {
    id: number;
    name: string;
    description: string | null;
  };
}

export interface Inventory {
  id: number;
  quantity: number;
  minStock: number;
  maxStock: number | null;
  productId: number;
  createdAt: string;
  updatedAt: string;

  product: InventoryProduct;
}

export interface InventoryTransaction {
  id: number;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
  note: string | null;
  inventoryId: number;
  createdAt: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalUnits: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export async function getInventory(): Promise<Inventory[]> {
  const response = await api.get("/inventory");

  return response.data.data;
}

export async function getInventoryStats(): Promise<InventoryStats> {
  const response = await api.get("/inventory/stats");

  return response.data.data;
}

export async function getLowStockInventory(): Promise<
  Inventory[]
> {
  const response = await api.get("/inventory/low-stock");

  return response.data.data;
}

export async function getProductInventory(
  productId: number
) {
  const response = await api.get(
    `/inventory/product/${productId}`
  );

  return response.data.data;
}

export async function stockIn(
  productId: number,
  quantity: number,
  note?: string
) {
  const response = await api.post(
    `/inventory/product/${productId}/stock-in`,
    {
      quantity,
      note,
    }
  );

  return response.data.data;
}

export async function stockOut(
  productId: number,
  quantity: number,
  note?: string
) {
  const response = await api.post(
    `/inventory/product/${productId}/stock-out`,
    {
      quantity,
      note,
    }
  );

  return response.data.data;
}
