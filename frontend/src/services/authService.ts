import api from "./api";

export interface Staff {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
}

export interface StaffLoginResult {
  token: string;
  staff: Staff;
}

export async function staffLogin(
  email: string,
  password: string
): Promise<StaffLoginResult> {
  const response = await api.post("/auth/staff/login", {
    email,
    password,
  });

  return response.data.data;
}
