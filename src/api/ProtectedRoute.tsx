// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export const ProtectedRoute = ({ children }: { children: any }) => {
  const { data, isLoading, isError, error } = useAuth();
  console.log("dalfjs",data, isLoading, isError, error)

  if (isLoading) return <div>Checking auth...</div>;

  if (isError || !data) {
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