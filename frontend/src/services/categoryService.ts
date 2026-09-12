import api from "./api";

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get("/categories");

  return response.data.data;
}
