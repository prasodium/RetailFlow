import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { TOKEN_KEY, loginCustomer, signupCustomer } from "../api";
import type { Customer } from "../types";

const CUSTOMER_KEY = "retailflow-shop-customer";

interface ShopAuthContextValue {
  customer: Customer | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => void;
}

const ShopAuthContext = createContext<ShopAuthContextValue | null>(null);

function loadCustomer(): Customer | null {
  const raw = localStorage.getItem(CUSTOMER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function ShopAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [customer, setCustomer] = useState<Customer | null>(loadCustomer);

  function persist(result: { token: string; customer: Customer }) {
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(result.customer));

    setToken(result.token);
    setCustomer(result.customer);
  }

  async function login(email: string, password: string) {
    const result = await loginCustomer(email, password);
    persist(result);
  }

  async function signup(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) {
    const result = await signupCustomer(input);
    persist(result);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);

    setToken(null);
    setCustomer(null);
  }

  return (
    <ShopAuthContext.Provider
      value={{ customer, token, login, signup, logout }}
    >
      {children}
    </ShopAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook must live alongside its provider/context
export function useShopAuth() {
  const ctx = useContext(ShopAuthContext);

  if (!ctx) {
    throw new Error("useShopAuth must be used within ShopAuthProvider");
  }

  return ctx;
}
