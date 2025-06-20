import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/auth",
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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

export default ProtectedRoute;
