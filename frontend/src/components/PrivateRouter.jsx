// components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { accessToken, user, loading, authChecked } = useAuth();
  const { t } = useTranslation("translation");

  // Chỉ hiển thị loading khi chưa hoàn thành xác thực
  if (!authChecked) {
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

  // ✅ Sau khi authChecked mới kiểm tra các điều kiện
  if (!accessToken || !user) {
    console.warn("🔒 Chuyển hướng về /login: thiếu token hoặc user");
    return <Navigate to="/login" replace />;
  }

  // ✅ Kiểm tra quyền
  if (allowedRoles && !allowedRoles.includes(user.role_name)) {
    console.warn("🚫 Không có quyền truy cập: chuyển hướng /not-found");
    return <Navigate to="/not-found" replace />;
  }

  // ✅ Passed all checks
  return children;
};

export default PrivateRoute;
