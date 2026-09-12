import axios from "axios";

const API_URL = "http://localhost:4000/api";

export interface Product {
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

  inventory: {
    id: number;
    quantity: number;
    minStock: number;
    maxStock: number | null;
  } | null;

  createdAt: string;
  updatedAt: string;
}

export async function getProducts(): Promise<Product[]> {
  const response = await axios.get(`${API_URL}/products`);

  return response.data.data;
}

export async function getProductById(
  id: number
): Promise<Product> {
  const response = await axios.get(`${API_URL}/products/${id}`);

  return response.data.data;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice: number;
  categoryId: number;
}

export async function createProduct(
  product: CreateProductInput
): Promise<Product> {
  const response = await axios.post(
    `${API_URL}/products`,
    product
  );

  return response.data.data;
}

export interface UpdateProductInput {
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice: number;
  categoryId: number;
}

export async function updateProduct(
  id: number,
  product: UpdateProductInput
): Promise<Product> {
  const response = await axios.put(
    `${API_URL}/products/${id}`,
    product
  );

  return response.data.data;
}

export async function deleteProduct(
  id: number
): Promise<void> {
  await axios.delete(`${API_URL}/products/${id}`);
}