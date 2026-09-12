export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Inventory {
  id: number;
  quantity: number;
  minStock: number;
  maxStock: number | null;
  productId: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  costPrice: string;
  categoryId: number;
  category: Category;
  inventory: Inventory | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}