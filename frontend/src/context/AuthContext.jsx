// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || ""
  );

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/monitor-environment/me/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setUser(res.data);
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUserInfo();
    }
  }, [accessToken]);

  const login = async (token) => {
    localStorage.setItem("accessToken", token);

    try {
      const res = await axios.get(`${API_BASE}/monitor-environment/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { email, username, role_name } = res.data;
      localStorage.setItem("userEmail", email);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role_name);
      console.log("👤 Logged in user:", res.data); // ✅ log tại đây
      // Nếu bạn dùng context:
      setUser(res.data);
    } catch (err) {
      console.error("❌ Lấy thông tin người dùng thất bại:", err);
      logout();
    }
  };

  const logout = () => {
    localStorage.clear();
    setAccessToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
