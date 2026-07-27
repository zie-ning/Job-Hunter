import { createContext, useContext, useState, type ReactNode } from "react";
import { mockAuthAdapter } from "../adapters/authAdapter";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    mockAuthAdapter.isAuthenticated(),
  );

  async function login(email: string, password: string) {
    await mockAuthAdapter.login(email, password);
    setIsAuthenticated(true);
  }

  function logout() {
    mockAuthAdapter.logout();
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
