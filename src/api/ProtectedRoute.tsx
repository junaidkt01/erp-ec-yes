// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth, getStoredAuth } from "../auth/useAuth";

export const ProtectedRoute = ({ children }: { children: any }) => {
  const { data, isLoading, isError } = useAuth();
  const storedAuth = getStoredAuth();
  const hasAuth = Boolean(data || storedAuth);

  if (isLoading && !storedAuth) return <div>Checking auth...</div>;

  if (!hasAuth || isError) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const RoleRoute = ({ children, role }: { children: any, role: any }) => {
  const { data, isLoading } = useAuth();

  if (isLoading) return <div />;

  if (data?.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};