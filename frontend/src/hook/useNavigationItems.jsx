import {
  HomeOutlined,
  SettingsOutlined,
  SensorsOutlined,
  GroupsOutlined,
  TaskOutlined,
  ReceiptLongOutlined,
  RouterOutlined,
} from "@mui/icons-material";
import { ROUTE_PATH } from "../config/router.config";
import { useTranslation } from "react-i18next";

const useNavigationItems = () => {
  const { t } = useTranslation("translation");

  return [
    {
      text: t("dashboard_title"),
      path: ROUTE_PATH.HOME,
      icon: <HomeOutlined />,
    },
    {
      text: t("settings"),
      path: ROUTE_PATH.SETTINGS,
      icon: <SettingsOutlined />,
      subItems: [
        { text: t("warning_threshold"), path: ROUTE_PATH.WARNING_THRESHOLD },
        { text: t("cleaning_days"), path: ROUTE_PATH.CLEANING_DAYS },
      ],
    },
    {
      text: t("monitoring_station"),
      path: ROUTE_PATH.MONITORING_STATION,
      icon: <SensorsOutlined />,
    },
    {
      text: t("device_management"),
      path: ROUTE_PATH.DEVICE_MANAGEMENT,
      icon: <RouterOutlined />,
    },
    {
      text: t("maintenance_approval"),
      path: ROUTE_PATH.MAINTENANCE_APPROVAL,
      icon: <TaskOutlined />,
    },
    {
      text: t("reports"),
      path: ROUTE_PATH.REPORTS,
      icon: <ReceiptLongOutlined />,
      subItems: [
        {
          text: t("reports_device_status"),
          path: ROUTE_PATH.REPORTS_DEVICE_STATUS,
        },
        {
          text: t("reports_warning_indicator"),
          path: ROUTE_PATH.REPORTS_WARNING_INDICATOR,
        },
      ],
    },
    {
      text: t("user_management"),
      path: ROUTE_PATH.USER_MANAGEMENT,
      icon: <GroupsOutlined />,
    },
  ];
};

export default useNavigationItems;
