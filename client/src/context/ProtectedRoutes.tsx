import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  fallbackComponent?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/auth",
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-gray-600"></Loader2>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the location they were trying to access for potential redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/unauthorized",
  fallbackComponent,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while authentication or user data is being fetched
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-gray-600"></Loader2>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to auth page
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const userRole = user?.role;
  const hasRequiredRole = Array.isArray(userRole)
    ? userRole.some((role) => allowedRoles.includes(role))
    : userRole !== undefined && allowedRoles.includes(userRole);

  if (!hasRequiredRole) {
    // Show toast and redirect immediately without rendering children
    toast.error("Unauthorized.");

    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
export { RoleProtectedRoute };
