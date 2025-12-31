import { createContext, useContext, useState, ReactNode, useEffect } from "react";
type UserInfo = {
  id: string;
  username: string;
  role: string;
};

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const baseUrl = (import.meta as any).env.VITE_API_BASE_URL;
      const resp = await fetch(`${baseUrl}/auth/me`, { credentials: 'include' });
      if (!resp.ok) throw new Error('unauthenticated');
      const userInfo: UserInfo = await resp.json();
      setUser(userInfo);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const baseUrl = (import.meta as any).env.VITE_API_BASE_URL;
    const resp = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    if (!resp.ok) throw new Error(`Login failed: ${resp.status}`);
    const data = await resp.json();
    setUser({ id: String(data.user.id), username: data.user.username, role: data.user.role });
  };

  const logout = async () => {
    try {
      const baseUrl = (import.meta as any).env.VITE_API_BASE_URL;
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
