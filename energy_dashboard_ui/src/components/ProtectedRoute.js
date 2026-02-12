import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function ProtectedRoute({ children }) {
  /** Enforce authentication for a route. */
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
