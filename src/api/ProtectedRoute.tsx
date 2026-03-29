// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export const ProtectedRoute = ({ children }) => {
  const { data, isLoading, isError } = useAuth();

  if (isLoading) return <div>Checking auth...</div>;

  // if (isError || !data) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export const RoleRoute = ({ children, role }) => {
  const { data, isLoading } = useAuth();

  if (isLoading) return <div />;

  if (data?.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};