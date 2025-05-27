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

  // 🔧 Cải tiến interceptor - tránh logout không cần thiết
  useEffect(() => {
    const interceptor = authAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // ❌ QUAN TRỌNG: Chỉ xử lý 401 khi đã hoàn thành init auth
        if (!authChecked) {
          return Promise.reject(error);
        }

        // ❌ Chỉ logout khi thực sự có token và user (đã đăng nhập)
        if (
          error.response?.status === 401 &&
          accessToken &&
          user &&
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
  }, [authChecked, accessToken, user]); // 🔧 Thêm dependencies

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

      // 🔧 Chỉ reset khi thực sự token không hợp lệ
      if (error.response?.status === 401) {
        if (tokenCheckAttempts >= MAX_TOKEN_CHECK_ATTEMPTS) {
          console.warn(
            `❌ Token không hợp lệ sau ${MAX_TOKEN_CHECK_ATTEMPTS} lần thử`
          );
          return null;
        }
        return "retry";
      }

      // 🔧 Với lỗi network, không reset auth
      if (error.code === "NETWORK_ERROR" || !error.response) {
        console.warn("🌐 Lỗi mạng, giữ nguyên trạng thái auth");
        return "network-error";
      }

      return "network-error";
    }
  };

  // 🔧 Cải tiến logic khởi tạo
  useEffect(() => {
    const initAuth = async () => {
      console.log("🚀 Bắt đầu khởi tạo auth...");
      setLoading(true);

      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      // ✅ Nếu có cả token và user trong localStorage
      if (token && storedUser) {
        console.log("📦 Tìm thấy token và user trong localStorage");

        try {
          const parsedUser = JSON.parse(storedUser);
          setAccessToken(token);
          setUser(parsedUser);

          // ✅ Verify token trong background, không block UI
          setTimeout(async () => {
            console.log("🔍 Verify token trong background...");
            const userInfo = await fetchUserInfo(token);

            // Chỉ logout nếu token thực sự không hợp lệ
            if (!userInfo && userInfo !== "network-error") {
              console.warn("❌ Token không hợp lệ, đang logout...");
              logout();
            }
          }, 100);
        } catch (err) {
          console.error("❌ Lỗi parse user từ localStorage:", err);
          logout();
        }
      }
      // ✅ Nếu chỉ có token, thử lấy user info
      else if (token) {
        console.log("🔑 Chỉ có token, đang lấy user info...");
        setAccessToken(token);

        let attempts = 0;
        let userInfo = null;

        while (attempts < MAX_TOKEN_CHECK_ATTEMPTS) {
          setTokenCheckAttempts(attempts);
          userInfo = await fetchUserInfo(token);

          if (
            userInfo &&
            userInfo !== "retry" &&
            userInfo !== "network-error"
          ) {
            console.log("✅ Lấy user info thành công");
            break;
          }

          if (userInfo === "network-error") {
            console.warn("🌐 Lỗi mạng, dừng retry");
            break;
          }

          console.log(`🔄 Retry lần ${attempts + 1}...`);
          await new Promise((r) => setTimeout(r, 1000));
          attempts++;
        }

        if (!userInfo || userInfo === "retry") {
          console.warn("❌ Không thể xác thực token");
          logout();
        }
      } else {
        console.log("🚫 Không có token, user chưa đăng nhập");
      }

      console.log("✅ Hoàn thành khởi tạo auth");
      setLoading(false);
      setAuthChecked(true);
    };

    initAuth();
  }, []); // 🔧 Chỉ chạy 1 lần khi mount

  // Đồng bộ giữa các tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log("📡 Storage changed:", e.key, e.newValue);

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
          try {
            setUser(JSON.parse(e.newValue));
          } catch (err) {
            console.error("❌ Lỗi parse user từ storage event:", err);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (token) => {
    console.log("🔐 Đang đăng nhập...");
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setLoading(true);

    try {
      const res = await authAxios.get(`/monitor-environment/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        console.log("✅ Đăng nhập thành công");
      }
    } catch (err) {
      console.error("❌ Lấy user sau login thất bại:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("🚪 Đăng xuất...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAccessToken("");
    setUser(null);
  };

  const isAuthenticated = () => {
    const hasAuth = !!accessToken && !!user;
    console.log("🔍 Check authentication:", {
      accessToken: !!accessToken,
      user: !!user,
      result: hasAuth,
    });
    return hasAuth;
  };

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

  // 🔧 Debug state changes
  useEffect(() => {
    console.log("🎯 Auth state:", {
      loading,
      authChecked,
      hasToken: !!accessToken,
      hasUser: !!user,
      isAuth: isAuthenticated(),
    });
  }, [loading, authChecked, accessToken, user]);

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
