import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATH } from "./config/router.config";
import {
  CleaningDayPage,
  DeviceStatusPage,
  HomePage,
  LoginPage,
  MaintenanceApprovalPage,
  ParameterDetailPage,
  StationDetailIndexPage,
  StationStatusPage,
  WarningIndicatorPage,
  WarningThresholdPage,
} from "./page";
import "@fontsource/ibm-plex-sans";
import MonitoringStationPage from "./page/MonitoringStationPage/MonitoringStationPage";
import DeviceManagementPage from "./page/DeviceManagementPage/DeviceManagementPage";
import SensorMaintenancePage from "./page/DeviceManagementPage/SensorMaintenancePage";
import SensorHistoryPage from "./page/DeviceManagementPage/SensorHistoryPage";
import UserManagementPage from "./page/UserManagementPage/UserManagementPage";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      localStorage.setItem("email", "chuleeminh265@gmail.com");
      console.log("✅ Email mặc định đã được lưu:", "test@example.com");
    }
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTE_PATH.HOME} replace />} />
        <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />
        <Route path={ROUTE_PATH.HOME || "" || "/"} element={<HomePage />} />
        <Route
          path={`${ROUTE_PATH.HOME}/plant/:plantId/stations`}
          element={<StationStatusPage />}
        />
        <Route
          path={`${ROUTE_PATH.HOME}/plant/:plantId/stations/:stationId/detail-index-lastest`}
          element={<StationDetailIndexPage />}
        />
        <Route
          path={`${ROUTE_PATH.HOME}/plant/:plantId/stations/:stationId/detail-index-lastest/:parameterKey`}
          element={<ParameterDetailPage />}
        />
        <Route
          path={ROUTE_PATH.SETTING_WARNING_THRESHOLD}
          element={<WarningThresholdPage />}
        />
        <Route
          path={ROUTE_PATH.SETTING_CLEANING_DAY}
          element={<CleaningDayPage />}
        />
        <Route
          path={ROUTE_PATH.MONITORING_STATION}
          element={<MonitoringStationPage />}
        />
        <Route
          path={ROUTE_PATH.DEVICE_MANAGEMENT}
          element={<DeviceManagementPage />}
        />
        <Route
          path={`${ROUTE_PATH.DEVICE_MANAGEMENT}/maintenance/:stationId/:sensorId`}
          element={<SensorMaintenancePage />}
        />
        <Route
          path={`${ROUTE_PATH.DEVICE_MANAGEMENT}/history/:sensorId`}
          element={<SensorHistoryPage />}
        />
        <Route
          path={ROUTE_PATH.MAINTENANCE_APPROVAL}
          element={<MaintenanceApprovalPage />}
        />
        <Route
          path={ROUTE_PATH.REPORT_DEVICE_STATUS}
          element={<DeviceStatusPage />}
        />
        <Route
          path={ROUTE_PATH.REPORT_WARNING_INDICATOR}
          element={<WarningIndicatorPage />}
        />
        <Route
          path={ROUTE_PATH.USER_MANAGEMENT}
          element={<UserManagementPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
