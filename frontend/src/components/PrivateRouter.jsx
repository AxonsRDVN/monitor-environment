// components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { accessToken, user, loading, authChecked } = useAuth();
  const { t } = useTranslation("translation");

  // Chỉ hiển thị loading khi đang xác thực và chưa hoàn thành kiểm tra
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
          <p className="mt-2">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Kiểm tra accessToken và user sau khi đã hoàn thành kiểm tra xác thực
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
