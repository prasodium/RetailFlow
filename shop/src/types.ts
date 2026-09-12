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
  imageUrl: string | null;
  categoryId: number;
  category: Category;
  inventory: Inventory | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  token: string;
  customer: Customer;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: Product;
}

export interface Order {
  id: number;
  invoiceNumber: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentMethod: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
  status: string;
  orderStatus: OrderStatus | null;
  shippingAddress: string | null;
  createdAt: string;
  items: OrderItem[];
}