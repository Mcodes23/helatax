import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Show loading spinner while checking user status
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 2. If no user, kick them to Login
  if (!user) {
    // "state={{ from: location }}" remembers where they wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If user exists, show the protected page
  return children;
};

export default ProtectedRoute;
