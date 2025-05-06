import Modal from "react-bootstrap/Modal";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import ReactCountryFlag from "react-country-flag";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { LANGUAGE_TYPE } from "../../i18n/type";
import logo from "../../assets/CPBackGround.jpg";
import "./LoginForm.css";
import axios from "axios";
import { ROUTE_PATH } from "../../config/router.config";
import CustomSnackbar from "../CustomSnackbar/CustomSnackbar";
import { useAuth } from "../../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_URL;

const LoginForm = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showWarningUserName, setShowWarningUserName] = useState(false);
  const [showWarningPassword, setShowWarningPassword] = useState(false);
  const [fullscreen, setFullSreen] = useState(
    window.innerWidth > 600 ? undefined : true
  );
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "warning" | "info"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const { t } = useTranslation("translation");

  const handlePressEnter = (event) => {
    if (event.code === "Enter") {
      handleLoginBtn();
    }
  };

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
    if (e.target.value) {
      setShowWarningUserName(false);
    }
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    if (e.target.value) {
      setShowWarningPassword(false);
    }
  };

  const handleLoginBtn = async () => {
    if (!username) {
      setShowWarningUserName(true);
      return;
    }

    if (!password) {
      setShowWarningPassword(true);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/monitor-environment/token/`, {
        username,
        password,
      });

      const { access, refresh } = res.data;
      await login(access);

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      showSnackbar("Đăng nhập thành công!", "success");
      setTimeout(() => {
        navigate(ROUTE_PATH.HOME);
      }, 200);
      navigate(ROUTE_PATH.HOME); // hoặc bất kỳ trang nào bạn muốn chuyển đến sau khi đăng nhập
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      if (error.response) {
        if (error.response.status === 401 || error.response.status === 400) {
          showSnackbar("Sai thông tin đăng nhập!", "error");
        } else if (error.response.status >= 500) {
          showSnackbar("Lỗi máy chủ!", "error");
        }
      } else {
        showSnackbar("Không thể kết nối đến máy chủ!", "error");
      }
    }
  };

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  window.addEventListener("resize", () => {
    setFullSreen(window.innerWidth > 600 ? undefined : true);
  });

  return (
    <div>
      <Modal show={true} centered fullscreen={fullscreen}>
        <Modal.Body as="div">
          <div className="login-form-container">
            <div className="d-flex flex-column align-items-center">
              <img src={logo} alt="logo" className="login-form-logo-img" />
              <div className="login-form-logo-img-content">IT CPV</div>
              <div className="login-form-title-2">{t("header_title")}</div>
            </div>
            <div className="d-flex flex-row">
              <div className="login-form-title">{t("login_title")}</div>
              <div className="login-form-flag-item">
                <div className="d-flex flex-row-reverse align-items-center">
                  <IconButton
                    size="small"
                    className={
                      i18n.language === LANGUAGE_TYPE.ENGLISH
                        ? "header-lang-btn-choosed"
                        : ""
                    }
                    onClick={() => handleChangeLanguage(LANGUAGE_TYPE.ENGLISH)}
                  >
                    <ReactCountryFlag
                      countryCode="US"
                      svg
                      className="header-container-2-sub-2-flag"
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ marginRight: "5px" }}
                    className={
                      i18n.language === LANGUAGE_TYPE.VIETNAMESE
                        ? "header-lang-btn-choosed"
                        : ""
                    }
                    onClick={() =>
                      handleChangeLanguage(LANGUAGE_TYPE.VIETNAMESE)
                    }
                  >
                    <ReactCountryFlag
                      countryCode="VN"
                      svg
                      className="header-container-2-sub-2-flag"
                    />
                  </IconButton>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <TextField
                variant="outlined"
                fullWidth
                sx={{ fontFamily: "IBM Plex Sans" }}
                label={t("login_email")}
                focused
                placeholder={t("login_email_placehoder")}
                value={username}
                onChange={handleChangeUsername}
                onKeyDown={handlePressEnter}
              />
              {showWarningUserName && (
                <div className="login-form-text-field-warning">
                  {t("login_email_warning")}
                </div>
              )}
            </div>
            <div className="mb-2">
              <FormControl variant="outlined" fullWidth focused>
                <InputLabel htmlFor="outlined-adornment-password">
                  {t("login_password")}
                </InputLabel>
                <OutlinedInput
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label={t("login_password")}
                  sx={{ fontFamily: "IBM Plex Sans" }}
                  placeholder={t("login_password_placehoder")}
                  value={password}
                  onChange={handleChangePassword}
                  onKeyDown={handlePressEnter}
                />
              </FormControl>
              {showWarningPassword && (
                <div className="login-form-text-field-warning">
                  {t("login_password_warning")}
                </div>
              )}
            </div>
            <div className="d-flex flex-row align-items-center">
              <Checkbox defaultChecked={false} />
              <div>{t("login_reset_password")}</div>
            </div>
            <Button
              variant="contained"
              fullWidth
              className="login-form-login-btn"
              onClick={handleLoginBtn}
            >
              {t("login_title")}
            </Button>
            <div className="login-form-forgot-password-btn">
              {t("login_forgot_password")}
            </div>
          </div>
          <div className="login-form-padding-bottom"></div>
          <CustomSnackbar
            open={snackbar.open}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            message={snackbar.message}
            severity={snackbar.severity}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginForm;
