import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { name: string; email: string; password: string; city?: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthResponse = { user?: User; token?: string; data?: { user?: User } };

function userFromAuth(data: AuthResponse) {
  return data.data?.user ?? data.user ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("carbontwin_token")) {
      setLoading(false);
      return;
    }
    api<AuthResponse>("/auth/me")
      .then((data) => setUser(userFromAuth(data)))
      .catch(() => localStorage.removeItem("carbontwin_token"))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      setUser,
      async login(email, password) {
        const data = await api<AuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        if (data.token) localStorage.setItem("carbontwin_token", data.token);
        setUser(userFromAuth(data));
      },
      async signup(input) {
        const data = await api<AuthResponse>("/auth/signup", {
          method: "POST",
          body: JSON.stringify(input)
        });
        if (data.token) localStorage.setItem("carbontwin_token", data.token);
        setUser(userFromAuth(data));
      },
      logout() {
        localStorage.removeItem("carbontwin_token");
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
