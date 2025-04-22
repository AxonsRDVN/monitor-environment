import { useTranslation } from "react-i18next";

const Header = () => {
  const { t } = useTranslation("translation");

  return (
    <div className="Header-container-0">
      <div className="Header-container-1">{t("Header")}</div>
    </div>
  );
};

export default Header;
