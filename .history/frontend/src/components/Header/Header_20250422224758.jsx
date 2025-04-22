import logoIcon from "../../assets/logo.png";
import logoAxon from "../../assets/logoAxons.png";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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

  const userName = localStorage.getItem("userName");

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

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
      <div className="d-flex flex-row align-items-center">
        <div className="header-menu-tab-mobile-btn">
          <IconButton onClick={handleClickMenuTabMobile}>
            <MenuIcon />
          </IconButton>
        </div>
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
        {isAuthen && (
          <div className="text-center">
            <AccountCircleIcon sx={{ marginRight: "5px" }} />
            <span className="header-container-2-sub-1-username">
              {userName}
            </span>
          </div>
        )}
        <div>
          <IconButton onClick={handleOpenMenu}>
            <ReactCountryFlag
              countryCode={currentLang === "vi" ? "VN" : "GB"}
              svg
              style={{ width: "24px", height: "24px" }}
            />
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
      </div>
    </div>
  );
};

export default Header;
