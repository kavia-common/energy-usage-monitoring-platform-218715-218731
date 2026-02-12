import React, { createContext, useContext, useMemo, useState } from "react";
import { getCurrentUser, login as doLogin, logout as doLogout, register as doRegister } from "../services/authService";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provide authentication state and actions to the app. */
  const [user, setUser] = useState(getCurrentUser());

  const value = useMemo(() => {
    return {
      user,
      async login({ email, password }) {
        const result = await doLogin({ email, password });
        setUser(result.user);
        return result;
      },
      async register({ email, password }) {
        const result = await doRegister({ email, password });
        setUser(result.user);
        return result;
      },
      async logout() {
        await doLogout();
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
