// components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { accessToken, user, loading } = useAuth();
  const { t } = useTranslation("translation");

  // Hiển thị loading khi đang lấy thông tin người dùng
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
          <p className="mt-2"></p>
        </div>
      </div>
    );
  }

  // Kiểm tra accessToken và user
  if (!accessToken || !user) {
    console.log("Chuyển hướng về trang login: token hoặc user không tồn tại");
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền truy cập
  if (allowedRoles && !allowedRoles.includes(user.role_name)) {
    console.log("Chuyển hướng đến not-found: không có quyền truy cập");
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

export default PrivateRoute;
