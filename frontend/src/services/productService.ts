import api from "./api";

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  costPrice: string;
  imageUrl: string | null;
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
  const response = await api.get("/products");

  return response.data.data;
}

export async function getProductById(
  id: number
): Promise<Product> {
  const response = await api.get(`/products/${id}`);

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
  const response = await api.post("/products", product);

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
  const response = await api.put(`/products/${id}`, product);

  return response.data.data;
}

export async function deleteProduct(
  id: number
): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function uploadProductImage(
  id: number,
  file: File
): Promise<Product> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(
    `/products/${id}/image`,
    formData,
    {
      // Let the browser set the multipart boundary itself — overriding
      // the shared instance's default JSON Content-Type would otherwise
      // send the body without one, which the server can't parse.
      headers: {
        "Content-Type": undefined,
      },
    }
  );

  return response.data.data;
}
