import {
  Home,
  Settings,
  Warning,
  CleaningServices,
  Sensors,
  Devices,
  Build,
  Report,
  Group,
  Error as ErrorIcon,
} from "@mui/icons-material";

import { ROUTE_PATH } from "./router.config";

export const SIDEBAR_MENU = [
  {
    label: "Trang chủ",
    path: ROUTE_PATH.HOME,
    icon: <Home />,
  },
  {
    label: "Cài đặt",
    icon: <Settings />,
    children: [
      {
        label: "Ngưỡng cảnh báo",
        path: ROUTE_PATH.SETTING_WARNING_THRESHOLD,
        icon: <Warning />,
      },
      {
        label: "Ngày vệ sinh",
        path: ROUTE_PATH.SETTING_CLEANING_DAY,
        icon: <CleaningServices />,
      },
    ],
  },
  {
    label: "Giám sát trạm",
    path: ROUTE_PATH.MONITORING_STATION,
    icon: <Sensors />,
  },
  {
    label: "Quản lý thiết bị",
    path: ROUTE_PATH.DEVICE_MANAGEMENT,
    icon: <Devices />,
  },
  {
    label: "Duyệt bảo trì",
    path: ROUTE_PATH.MAINTENANCE_APPROVAL,
    icon: <Build />,
  },
  {
    label: "Báo cáo",
    icon: <Report />,
    children: [
      {
        label: "Trạng thái thiết bị",
        path: ROUTE_PATH.REPORT_DEVICE_STATUS,
      },
      {
        label: "Chỉ số cảnh báo",
        path: ROUTE_PATH.REPORT_WARNING_INDICATOR,
      },
    ],
  },
  {
    label: "Quản lý người dùng",
    path: ROUTE_PATH.USER_MANAGEMENT,
    icon: <Group />,
  },
];
