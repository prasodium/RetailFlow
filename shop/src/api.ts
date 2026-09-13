import type {
  AuthResult,
  Category,
  Order,
  Product,
} from "./types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
export const API_URL = `${API_BASE_URL}/api`;
export const ASSET_BASE_URL = API_BASE_URL;

export const TOKEN_KEY = "retailflow-shop-token";

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    ...(options.body && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Request failed"
    );
  }

  return result.data;
}

export function getProducts() {
  return request<Product[]>("/products");
}

export function getProduct(id: number) {
  return request<Product>(
    `/products/${id}`
  );
}

export function getCategories() {
  return request<Category[]>(
    "/categories"
  );
}

export function signupCustomer(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}) {
  return request<AuthResult>("/auth/customer/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginCustomer(email: string, password: string) {
  return request<AuthResult>("/auth/customer/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export interface PlaceOrderInput {
  customer?: {
    name: string;
    email?: string;
    phone: string;
    address: string;
  };
  paymentMethod: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
  shippingAddress?: string;
  items: { productId: number; quantity: number }[];
}

export function placeOrder(input: PlaceOrderInput) {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMyOrders() {
  return request<Order[]>("/orders/mine");
}

export function getOrder(id: number) {
  return request<Order>(`/orders/${id}`);
}

export function getHomeRecommendations() {
  return request<Product[]>("/recommendations/home");
}

export function getProductRecommendations(productId: number) {
  return request<Product[]>(`/recommendations/product/${productId}`);
}

export function getCartRecommendations(productIds: number[]) {
  return request<Product[]>("/recommendations/cart", {
    method: "POST",
    body: JSON.stringify({ productIds }),
  });
}

export function getRecentlyViewed() {
  return request<Product[]>("/customers/me/recently-viewed");
}

export function getPopularProducts(limit = 30) {
  return request<Product[]>(`/products/popular?limit=${limit}`);
}
