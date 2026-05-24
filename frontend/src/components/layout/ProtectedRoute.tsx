import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Skeleton } from "../ui/Skeleton";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Skeleton className="h-80 w-full" />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
