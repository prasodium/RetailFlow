export interface Category {
  id: number;
  name: string;
  description: string | null;
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
  inventory?: Inventory | null;
}

export interface Inventory {
  id: number;
  quantity: number;
  minStock: number;
  maxStock: number | null;
  productId: number;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: Product;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  customerId: number | null;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentMethod: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
  status: string;
  createdAt: string;
  customer: Customer | null;
  items: SaleItem[];
}