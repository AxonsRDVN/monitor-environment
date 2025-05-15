// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = process.env.REACT_APP_API_URL;

// Tạo instance axios riêng để có thể thêm interceptor
const authAxios = axios.create({
  baseURL: API_BASE,
});

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
  const [tokenCheckAttempts, setTokenCheckAttempts] = useState(0);
  const MAX_TOKEN_CHECK_ATTEMPTS = 3; // Số lần thử tối đa

  // Thêm interceptor để xử lý lỗi 401 tự động
  useEffect(() => {
    const interceptor = authAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Không tự động logout khi đang kiểm tra token
        if (loading) {
          return Promise.reject(error);
        }

        // Nếu lỗi 401 và không phải đang ở trang login
        if (
          error.response?.status === 401 &&
          window.location.pathname !== "/login"
        ) {
          console.warn("Token không hợp lệ hoặc hết hạn. Đang thử refresh...");

          // Thực hiện refresh token ở đây nếu bạn có API refresh token
          // Ví dụ: tryRefreshToken();

          // Nếu không có refresh token, logout người dùng sau khi hiện thông báo
          setTimeout(() => {
            logout();
            // Redirect to login page
            window.location.href = "/login";
          }, 2000);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      authAxios.interceptors.response.eject(interceptor);
    };
  }, [loading]);

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
      console.error("❌ Lỗi lấy thông tin người dùng:", error);

      // Chỉ logout nếu lỗi 401 và đã thử nhiều lần
      if (
        error.response?.status === 401 &&
        tokenCheckAttempts >= MAX_TOKEN_CHECK_ATTEMPTS
      ) {
        console.warn(
          `Đã thử kiểm tra token ${MAX_TOKEN_CHECK_ATTEMPTS} lần và thất bại.`
        );
        return null;
      }

      // Không trả về null ngay nếu chưa đạt số lần thử tối đa
      // (sẽ tiếp tục thử ở useEffect)
      if (error.response?.status === 401) {
        return "retry";
      }

      // Nếu lỗi không phải 401 (ví dụ lỗi mạng), không logout ngay
      return "network-error";
    }
  };

  // Xử lý đồng bộ trạng thái đăng nhập giữa các tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken") {
        // Nếu token bị xóa ở tab khác
        if (!e.newValue && accessToken) {
          setAccessToken("");
          setUser(null);
        }
        // Nếu token được thêm ở tab khác
        else if (e.newValue && e.newValue !== accessToken) {
          setAccessToken(e.newValue);
          fetchUserInfo(e.newValue);
        }
      } else if (e.key === "user") {
        // Đồng bộ thông tin user giữa các tab
        if (!e.newValue) {
          setUser(null);
        } else {
          setUser(JSON.parse(e.newValue));
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [accessToken]);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (token) {
        setAccessToken(token);

        // Thêm cơ chế retry cho việc kiểm tra token
        let attempts = 0;
        let userInfo = null;

        while (attempts < MAX_TOKEN_CHECK_ATTEMPTS) {
          setTokenCheckAttempts(attempts);
          userInfo = await fetchUserInfo(token);

          // Nếu lấy được thông tin user hoặc không cần retry
          if (userInfo !== "retry" && userInfo !== "network-error") {
            break;
          }

          // Nếu là lỗi mạng, đợi lâu hơn trước khi thử lại
          if (userInfo === "network-error") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          attempts++;
        }

        // Nếu sau tất cả các lần thử mà vẫn không có user
        if (!userInfo || userInfo === "retry" || userInfo === "network-error") {
          console.warn("Không thể xác thực token sau nhiều lần thử");
          // Giữ nguyên token trong localStorage nhưng đánh dấu chưa xác thực
          // Người dùng có thể thử lại sau khi kết nối mạng ổn định
          if (userInfo === "network-error") {
            setUser(null);
          } else {
            // Nếu lỗi không phải do mạng, có thể token hết hạn
            logout();
          }
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
      const res = await authAxios.get(`/monitor-environment/me/`, {
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

  const isAuthenticated = () => {
    return !!accessToken && !!user;
  };

  // Hàm để thử lấy lại thông tin user nếu cần
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
        retryAuthentication, // Thêm function này để component khác có thể gọi khi cần
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
