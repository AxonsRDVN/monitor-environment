import { useTranslation } from "react-i18next";
import "./Footer.css";

const Footer = () => {
  const { t } = useTranslation("translation");

  return (
    <div className="footer-container-0">
      <div className="footer-container-1">{t("footer")}</div>
    </div>
  );
};

export default Footer;
