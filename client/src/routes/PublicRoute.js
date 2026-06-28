import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Keeps signed-in users out of the landing/login/signup pages.
const PublicRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;
