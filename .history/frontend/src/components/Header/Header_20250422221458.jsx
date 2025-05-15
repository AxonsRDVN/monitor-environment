import logoHeader from "../../assets/logo_header.jpg";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { LANGUAGE_TYPE } from "../../i18n/type";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { ROUTE_PATH } from "../../config/routes.config";
import "./Header.css";

const Header = (props) => {
  const { isAuthen } = props;
  const { t } = useTranslation("translation");
  const navigate = useNavigate();
  const appContext = useContext(AppContext);
  const [displayHeader, setDisplayHeader] = useState(
    !isAuthen && window.innerWidth <= 600 ? "none" : "flex"
  );
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        setUserName(parsed.username || "");
      } catch (e) {
        console.error("❌ Lỗi khi parse user:", e);
      }
    }
  }, []);

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
          src={logoHeader}
          alt="logo"
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
        <div className="d-flex flex-row align-items-center header-container-2-sub-2">
          <IconButton
            size="small"
            sx={{ marginRight: "5px" }}
            className={
              i18n.language === LANGUAGE_TYPE.VIETNAMESE
                ? "header-lang-btn-choosed"
                : ""
            }
            onClick={() => handleChangeLanguage(LANGUAGE_TYPE.VIETNAMESE)}
          >
            <ReactCountryFlag
              countryCode="VN"
              svg
              className="header-container-2-sub-2-flag"
            />
          </IconButton>
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
              countryCode="GB"
              svg
              className="header-container-2-sub-2-flag"
            />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Header;
