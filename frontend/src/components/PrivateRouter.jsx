// components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles  }) => {
  const { accessToken, user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/not-found" replace />;
  }
  return accessToken ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
