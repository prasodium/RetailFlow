import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { TOKEN_KEY, STAFF_KEY } from "../services/api";
import { staffLogin, type Staff } from "../services/authService";

interface AdminAuthContextValue {
  staff: Staff | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function loadStaff(): Staff | null {
  const raw = localStorage.getItem(STAFF_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [staff, setStaff] = useState<Staff | null>(loadStaff);

  async function login(email: string, password: string) {
    const result = await staffLogin(email, password);

    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(STAFF_KEY, JSON.stringify(result.staff));

    setToken(result.token);
    setStaff(result.staff);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STAFF_KEY);

    setToken(null);
    setStaff(null);
  }

  return (
    <AdminAuthContext.Provider value={{ staff, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook must live alongside its provider/context
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);

  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return ctx;
}
