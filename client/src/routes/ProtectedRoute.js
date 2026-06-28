import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Gate for authenticated-only routes.
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/welcome" replace />;
};

export default ProtectedRoute;
