"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { get, post, tokens } from "./api";
import type { Role, TokenPair, User } from "./types";

type SignupInput = {
  employee_id: string;
  email: string;
  password: string;
  full_name: string;
  role: Role;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export const homeFor = (role: Role) => (role === "admin" ? "/admin/dashboard" : "/employee/dashboard");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore the session on first mount. A stored token that no longer works is
  // cleared rather than left to fail every later request. State lands in the
  // promise continuation, never synchronously inside the effect.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!tokens.access) return null;
      try {
        return await get<User>("/auth/me");
      } catch {
        tokens.clear();
        return null;
      }
    };

    void restore().then((me) => {
      if (cancelled) return;
      setUser(me);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const authenticate = useCallback(async (pair: TokenPair) => {
    tokens.save(pair);
    const me = await get<User>("/auth/me");
    setUser(me);
    return me;
  }, []);

  const login = useCallback(
    async (email: string, password: string) =>
      authenticate(await post<TokenPair>("/auth/login", { email, password })),
    [authenticate],
  );

  const signup = useCallback(
    async (input: SignupInput) => authenticate(await post<TokenPair>("/auth/signup", input)),
    [authenticate],
  );

  const logout = useCallback(() => {
    tokens.clear();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    setUser(await get<User>("/auth/me"));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refreshUser }),
    [user, loading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
