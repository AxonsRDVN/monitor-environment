// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || ""
  );
  const [authChecked, setAuthChecked] = useState(false); // Thêm state để đánh dấu đã kiểm tra auth

  const fetchUserInfo = async (token) => {
    if (!token) {
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/monitor-environment/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setUser(res.data);
        // Đảm bảo thông tin người dùng được lưu trữ khi refresh
        const { email, username, role_name, full_name } = res.data;
        localStorage.setItem("userEmail", email);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role_name);
        if (full_name) localStorage.setItem("fullName", full_name);
      }
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin người dùng:", error);

      // Nếu token hết hạn hoặc lỗi 401 → xóa token
      if (error.response?.status === 401) {
        logout();
      }
      // Nếu lỗi khác (network, server...) thì không nên xóa vội
      // Xem xét thêm logic retry ở đây nếu cần thiết
    } finally {
      setLoading(false);
      setAuthChecked(true); // Đánh dấu đã kiểm tra xong
    }
  };

  // useEffect với dependency là empty array để chỉ chạy 1 lần khi mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (token) {
        setAccessToken(token);
        await fetchUserInfo(token);
      } else {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, []);

  const login = async (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
      setAccessToken(token);
      setLoading(true);

      try {
        const res = await axios.get(`${API_BASE}/monitor-environment/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { email, username, role_name, full_name } = res.data;
        localStorage.setItem("userEmail", email);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role_name);
        if (full_name) localStorage.setItem("fullName", full_name);
        setUser(res.data);
      } catch (err) {
        console.error("❌ Lấy thông tin người dùng thất bại:", err);
        logout();
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    setAccessToken("");
    setUser(null);
  };

  // Thêm một phương thức để kiểm tra token hợp lệ
  const isAuthenticated = () => {
    return !!accessToken && !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        loading,
        isAuthenticated,
        authChecked, // Xuất state mới
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
