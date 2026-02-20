"use client";

import { useAuth } from "@/hooks/useAuth";
import { createContext, ReactNode, useContext } from "react";

type AuthContextType = ReturnType<typeof useAuth>;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authData = useAuth();
  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
