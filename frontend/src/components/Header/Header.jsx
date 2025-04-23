import logoIcon from "../../assets/logo.png";
import logoAxon from "../../assets/logoAxons.png";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { LANGUAGE_TYPE } from "../../i18n/type";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { ROUTE_PATH } from "../../config/router.config";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import "./Header.css";

const Header = (props) => {
  const { isAuthen } = props;
  const { t } = useTranslation("translation");
  const navigate = useNavigate();
  const appContext = useContext(AppContext);
  const [displayHeader, setDisplayHeader] = useState(
    !isAuthen && window.innerWidth <= 600 ? "none" : "flex"
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  // Dữ liệu giả (bạn có thể lấy từ localStorage, context, v.v.)
  const userName = localStorage.getItem("userName") || "Nguyễn Văn A";
  const userRole = localStorage.getItem("userRole") || "Quản trị viên";

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = (lang) => {
    i18n.changeLanguage(lang);
    handleCloseMenu();
  };

  const currentLang = i18n.language; // 'vi' | 'en'

  const handleClickMenuTabMobile = () => {
    appContext.setShowButtonAboutUs(true);
    appContext.setOpenMenuTabMobile(true);
  };

  const navigateToHome = () => navigate(ROUTE_PATH.COLD_STORAGE_DASHBOARD);

  window.addEventListener("resize", () => {
    setDisplayHeader(!isAuthen && window.innerWidth <= 600 ? "none" : "flex");
  });

  return (
    <div className="header-container-0" style={{ display: displayHeader }}>
      <div className="d-flex flex-row align-items-center justify-items-start">
        <img
          src={logoIcon}
          alt="logo icon"
          className="header-container-1-logo-img"
          onClick={navigateToHome}
        />
        <img
          src={logoAxon}
          alt="logo axon"
          className="header-container-1-logo-img"
          onClick={navigateToHome}
        />
        <span className="header-container-1-title">{t("header_title")}</span>
      </div>
      <div className="d-flex flex-row align-items-center header-container-2">
        <div>
          <ReactCountryFlag
            countryCode={currentLang === "vi" ? "VN" : "GB"}
            svg
            style={{ width: "24px", height: "24px" }}
          />
          <IconButton onClick={handleOpenMenu}>
            <ExpandMoreIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
            <MenuItem
              onClick={() => handleSelectLanguage(LANGUAGE_TYPE.VIETNAMESE)}
            >
              <ListItemIcon>
                <ReactCountryFlag
                  countryCode="VN"
                  svg
                  style={{ width: "20px", height: "20px" }}
                />
              </ListItemIcon>
              <ListItemText>VN</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleSelectLanguage(LANGUAGE_TYPE.ENGLISH)}
            >
              <ListItemIcon>
                <ReactCountryFlag
                  countryCode="GB"
                  svg
                  style={{ width: "20px", height: "20px" }}
                />
              </ListItemIcon>
              <ListItemText>ENG</ListItemText>
            </MenuItem>
          </Menu>
        </div>
        {isAuthen && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: {
                xs: 0,
                sm: 2,
              },
              p: "18px 0",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.5"
                y="0.5"
                width="43"
                height="43"
                rx="21.5"
                fill="white"
                stroke="#E4E7EC"
              />
              <path
                d="M22.0001 10.3335C20.453 10.3335 18.9693 10.9481 17.8753 12.042C16.7813 13.136 16.1667 14.6197 16.1667 16.1668C16.1667 17.7139 16.7813 19.1977 17.8753 20.2916C18.9693 21.3856 20.453 22.0002 22.0001 22.0002C23.5472 22.0002 25.0309 21.3856 26.1249 20.2916C27.2188 19.1977 27.8334 17.7139 27.8334 16.1668C27.8334 14.6197 27.2188 13.136 26.1249 12.042C25.0309 10.9481 23.5472 10.3335 22.0001 10.3335ZM29.0123 24.3335H14.9878C13.708 24.3335 12.6667 25.3747 12.6667 26.6546V27.5418C12.6667 29.4738 13.7663 31.1445 15.7625 32.2452C17.4232 33.1622 19.6387 33.6668 22.0001 33.6668C26.4952 33.6668 31.3334 31.75 31.3334 27.5418V26.6546C31.3334 25.3747 30.2922 24.3335 29.0123 24.3335Z"
                fill="#0A6EE1"
              />
            </svg>

            <Box
              sx={{
                textAlign: "left",
                ml: {
                  xs: 0,
                  sm: 1,
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "22px",
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              >
                {userName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize={14}
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              >
                ({userRole})
              </Typography>
            </Box>
            <IconButton onClick={handleUserMenuOpen}>
              <ExpandMoreIcon />
            </IconButton>

            <Menu
              anchorEl={userMenuAnchorEl}
              open={isUserMenuOpen}
              onClose={handleUserMenuClose}
            >
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate("/profile");
                }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Thông tin cá nhân</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  // xử lý logout ở đây
                  localStorage.clear();
                  navigate("/login");
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Đăng xuất</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </div>
    </div>
  );
};

export default Header;
