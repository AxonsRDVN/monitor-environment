// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // Load accessToken và user từ localStorage ngay từ đầu
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || ""
  );
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [authChecked, setAuthChecked] = useState(false);

  const fetchUserInfo = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/monitor-environment/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin người dùng:", error);
      if (error.response?.status === 401) {
        logout(); // token hết hạn
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (token) {
        setAccessToken(token);
        if (!user) {
          await fetchUserInfo(token); // Chỉ fetch nếu chưa có user
        }
      }
      setLoading(false);
      setAuthChecked(true);
    };

    initAuth();
  }, []);

  const login = async (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/monitor-environment/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("❌ Lấy thông tin người dùng thất bại:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAccessToken("");
    setUser(null);
  };

  const isAuthenticated = () => !!accessToken && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        loading,
        isAuthenticated,
        authChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
