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

  const fetchUserInfo = async (token) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/monitor-environment/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setUser(res.data);
        // Đảm bảo thông tin người dùng được lưu trữ khi refresh
        const { email, username, role_name } = res.data;
        localStorage.setItem("userEmail", email);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role_name);
      }
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin người dùng:", error);
      // Xóa token không hợp lệ
      setUser(null);
      setAccessToken("");
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  // Thêm useEffect với dependency accessToken
  useEffect(() => {
    fetchUserInfo(accessToken);
  }, [accessToken]);

  const login = async (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setLoading(true); // Bắt đầu loading khi login

    try {
      const res = await axios.get(`${API_BASE}/monitor-environment/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { email, username, role_name } = res.data;
      localStorage.setItem("userEmail", email);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role_name);
      setUser(res.data);
    } catch (err) {
      console.error("❌ Lấy thông tin người dùng thất bại:", err);
      logout();
    } finally {
      setLoading(false); // Đảm bảo loading kết thúc
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
