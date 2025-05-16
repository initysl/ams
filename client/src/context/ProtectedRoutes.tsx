import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Loader className="animate-spin h-12 w-12  border-green-600"></Loader>
        {/* Use skeleton */}
        {/* <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div> */}
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
