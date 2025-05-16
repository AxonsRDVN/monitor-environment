import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = process.env.REACT_APP_API_URL;

// Axios instance riêng để thêm interceptor
export const authAxios = axios.create({
  baseURL: API_BASE,
});

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || ""
  );
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [tokenCheckAttempts, setTokenCheckAttempts] = useState(0);
  const MAX_TOKEN_CHECK_ATTEMPTS = 3;

  // Interceptor bắt lỗi 401
  useEffect(() => {
    const interceptor = authAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (loading || !authChecked) {
          return Promise.reject(error);
        }

        if (
          error.response?.status === 401 &&
          window.location.pathname !== "/login"
        ) {
          console.warn("⛔ Token hết hạn hoặc không hợp lệ. Đang logout...");
          logout();
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }
    );

    return () => {
      authAxios.interceptors.response.eject(interceptor);
    };
  }, [loading, authChecked]);

  const fetchUserInfo = async (token) => {
    if (!token) return null;

    try {
      const res = await authAxios.get(`/monitor-environment/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        return res.data;
      }

      return null;
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin user:", error);

      if (
        error.response?.status === 401 &&
        tokenCheckAttempts >= MAX_TOKEN_CHECK_ATTEMPTS
      ) {
        console.warn(`❌ Token sai sau ${MAX_TOKEN_CHECK_ATTEMPTS} lần thử`);
        return null;
      }

      if (error.response?.status === 401) {
        return "retry";
      }

      return "network-error";
    }
  };

  // Khởi tạo xác thực khi load lần đầu
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (token) {
        setAccessToken(token);

        let attempts = 0;
        let userInfo = null;

        while (attempts < MAX_TOKEN_CHECK_ATTEMPTS) {
          setTokenCheckAttempts(attempts);
          userInfo = await fetchUserInfo(token);

          if (userInfo !== "retry" && userInfo !== "network-error") break;

          await new Promise((r) =>
            setTimeout(r, userInfo === "network-error" ? 2000 : 1000)
          );

          attempts++;
        }

        if (!userInfo || userInfo === "retry") {
          console.warn("❌ Không xác thực được sau nhiều lần");
          logout();
        } else if (userInfo === "network-error") {
          setUser(null); // Giữ token nhưng chưa xác thực
        }
      }

      setLoading(false);
      setAuthChecked(true);
    };

    initAuth();
  }, []);

  // Đồng bộ giữa các tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken") {
        const newToken = e.newValue;
        setAccessToken(newToken || "");
        if (newToken) {
          fetchUserInfo(newToken);
        } else {
          setUser(null);
        }
      } else if (e.key === "user") {
        if (!e.newValue) {
          setUser(null);
        } else {
          setUser(JSON.parse(e.newValue));
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [accessToken]);

  const login = async (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setLoading(true);

    try {
      const res = await authAxios.get(`/monitor-environment/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("❌ Lấy user sau login thất bại:", err);
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

  const retryAuthentication = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setLoading(true);
      const userInfo = await fetchUserInfo(token);
      setLoading(false);
      return !!userInfo && userInfo !== "retry" && userInfo !== "network-error";
    }
    return false;
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
        authChecked,
        retryAuthentication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
