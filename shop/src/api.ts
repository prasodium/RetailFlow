import type {
  Category,
  Product,
} from "./types";

const API_URL = "http://localhost:4000/api";

async function request<T>(url: string): Promise<T> {
  const response = await fetch(
    `${API_URL}${url}`
  );

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