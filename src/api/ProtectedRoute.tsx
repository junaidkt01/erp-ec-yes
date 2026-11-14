// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, getStoredAuth } from "../auth/useAuth";
import { useRouteAccess } from "../auth/usePermissions";
import { ErrorStatusOverlay } from "../components/Loadingoverlay";

/**
 * Layout route: wrap all private routes once. Checks login, then the permission
 * (permission_id / permission) of the sidebar menu that owns the current URL.
 */
export const PermissionRoute = () => {
  const { pathname } = useLocation();
  const { allowed, isLoading } = useRouteAccess(pathname);

  if (isLoading) return null;
  if (!allowed) {
    return <ErrorStatusOverlay key={pathname} isError={true} status={403} message="You don't have permission to access this page." />;
  }
  return <Outlet />;
};

export const PrivateRoutes = () => (
  <ProtectedRoute>
    <PermissionRoute />
  </ProtectedRoute>
);

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