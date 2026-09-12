import axios from "axios";

const API_URL = "http://localhost:4000/api";

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await axios.get(`${API_URL}/categories`);

  return response.data.data;
}