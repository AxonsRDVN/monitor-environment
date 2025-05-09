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
      text: t("home_page"),
      path: ROUTE_PATH.HOME,
      icon: <HomeOutlined />,
      allowedRoles: ["admin", "manager", "user"],
    },
    {
      text: t("setting"),
      path: ROUTE_PATH.SETTINGS,
      icon: <SettingsOutlined />,
      allowedRoles: ["admin", "manager"],
      subItems: [
        {
          text: t("warning_threshhold"),
          path: ROUTE_PATH.SETTING_WARNING_THRESHOLD,
          allowedRoles: ["admin", "manager"],
        },
        {
          text: t("cleaning_day"),
          path: ROUTE_PATH.SETTING_CLEANING_DAY,
          allowedRoles: ["admin", "manager"],
        },
      ],
    },
    {
      text: t("monitoring_station"),
      path: ROUTE_PATH.MONITORING_STATION,
      icon: <SensorsOutlined />,
      allowedRoles: ["admin", "manager"],
    },
    {
      text: t("device_management"),
      path: ROUTE_PATH.DEVICE_MANAGEMENT,
      icon: <RouterOutlined />,
      allowedRoles: ["admin", "manager", "user"],
    },
    {
      text: t("maintenance_approval"),
      path: ROUTE_PATH.MAINTENANCE_APPROVAL,
      icon: <TaskOutlined />,
      allowedRoles: ["admin", "manager"],
    },
    {
      text: t("report"),
      path: ROUTE_PATH.REPORTS,
      icon: <ReceiptLongOutlined />,
      allowedRoles: ["admin", "manager", "user"],
      subItems: [
        {
          text: t("device_status"),
          path: ROUTE_PATH.REPORT_DEVICE_STATUS,
          allowedRoles: ["admin", "manager", "user"],
        },
        {
          text: t("warning_index"),
          path: ROUTE_PATH.REPORT_WARNING_INDICATOR,
          allowedRoles: ["admin", "manager", "user"],
        },
      ],
    },
    {
      text: t("user_management"),
      path: ROUTE_PATH.USER_MANAGEMENT,
      icon: <GroupsOutlined />,
      allowedRoles: ["admin"],
    },
  ];
};

export default useNavigationItems;
