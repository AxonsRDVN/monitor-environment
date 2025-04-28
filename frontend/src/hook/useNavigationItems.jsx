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

const useNavigationItems = () => {
  return [
    {
      text: "Trang chủ",
      path: ROUTE_PATH.HOME,
      icon: <HomeOutlined />,
    },
    {
      text: "Cài đặt",
      path: ROUTE_PATH.SETTINGS,
      icon: <SettingsOutlined />,
      subItems: [
        {
          text: "Ngưỡng cảnh báo",
          path: ROUTE_PATH.SETTING_WARNING_THRESHOLD,
        },
        {
          text: "Số ngày vệ sinh",
          path: ROUTE_PATH.SETTING_CLEANING_DAY,
        },
      ],
    },
    {
      text: "Trạm giám sát",
      path: ROUTE_PATH.MONITORING_STATION,
      icon: <SensorsOutlined />,
    },
    {
      text: "Quản lý thiết bị",
      path: ROUTE_PATH.DEVICE_MANAGEMENT,
      icon: <RouterOutlined />,
    },
    {
      text: "Duyệt bảo trì",
      path: ROUTE_PATH.MAINTENANCE_APPROVAL,
      icon: <TaskOutlined />,
    },
    {
      text: "Báo cáo",
      path: ROUTE_PATH.REPORTS,
      icon: <ReceiptLongOutlined />,
      subItems: [
        {
          text: "Báo cáo trạng thái thiết bị",
          path: ROUTE_PATH.REPORT_DEVICE_STATUS,
        },
        {
          text: "Báo cáo chỉ số cảnh báo",
          path: ROUTE_PATH.REPORT_WARNING_INDICATOR,
        },
      ],
    },
    {
      text: "Quản lý người dùng",
      path: ROUTE_PATH.USER_MANAGEMENT,
      icon: <GroupsOutlined />,
    },
  ];
};

export default useNavigationItems;
