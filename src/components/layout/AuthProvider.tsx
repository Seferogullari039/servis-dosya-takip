"use client";

import { createContext, useContext } from "react";
import type { AuthSession } from "@/lib/auth/types";

const AuthContext = createContext<AuthSession | null>(null);

export function AuthProvider({
  session,
  children,
}: {
  session: AuthSession;
  children: React.ReactNode;
}) {
  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthSession {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth yalnızca AuthProvider içinde kullanılabilir.");
  }
  return ctx;
}
