// components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { accessToken, user, loading, authChecked } = useAuth();
  const { t } = useTranslation("translation");

  // 🔧 Debug log để theo dõi state
  console.log("🛡️ PrivateRoute state:", {
    loading,
    authChecked,
    hasToken: !!accessToken,
    hasUser: !!user,
    pathname: window.location.pathname,
  });

  // ✅ Chờ hoàn thành auth check trước khi quyết định
  if (!authChecked || loading) {
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

  // ✅ Kiểm tra authentication sau khi authChecked
  if (!accessToken || !user) {
    console.warn("🔒 Chuyển hướng về /login: thiếu token hoặc user");
    return <Navigate to="/login" replace />;
  }

  // ✅ Kiểm tra quyền nếu có yêu cầu
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role_name)
  ) {
    console.warn(
      `🚫 Không có quyền truy cập. Quyền hiện tại: ${
        user.role_name
      }, Quyền yêu cầu: ${allowedRoles.join(", ")}`
    );
    return <Navigate to="/not-found" replace />;
  }

  console.log("✅ PrivateRoute: Cho phép truy cập");
  return children;
};

export default PrivateRoute;
