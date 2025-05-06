import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATH } from "./config/router.config";
import {
  CleaningDayPage,
  DeviceStatusPage,
  HomePage,
  LoginPage,
  MaintenanceApprovalPage,
  NoPermissionPage,
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
import PrivateRoute from "./components/PrivateRouter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTE_PATH.HOME} replace />} />
        <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />

        <Route
          path={ROUTE_PATH.HOME}
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path={`${ROUTE_PATH.HOME}/plant/:plantId/stations`}
          element={
            <PrivateRoute>
              <StationStatusPage />
            </PrivateRoute>
          }
        />
        <Route
          path={`${ROUTE_PATH.HOME}/plant/:plantId/stations/:stationId/detail-index-lastest`}
          element={
            <PrivateRoute>
              <StationDetailIndexPage />
            </PrivateRoute>
          }
        />
        <Route
          path={`${ROUTE_PATH.HOME}/plant/:plantId/stations/:stationId/detail-index-lastest/:parameterKey`}
          element={
            <PrivateRoute>
              <ParameterDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTE_PATH.SETTING_WARNING_THRESHOLD}
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <WarningThresholdPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTE_PATH.SETTING_CLEANING_DAY}
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <CleaningDayPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTE_PATH.MONITORING_STATION}
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <MonitoringStationPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTE_PATH.DEVICE_MANAGEMENT}
          element={
            <PrivateRoute>
              <DeviceManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path={`${ROUTE_PATH.DEVICE_MANAGEMENT}/maintenance/:stationId/:sensorId`}
          element={
            <PrivateRoute>
              <SensorMaintenancePage />
            </PrivateRoute>
          }
        />
        <Route
          path={`${ROUTE_PATH.DEVICE_MANAGEMENT}/history/:sensorId`}
          element={
            <PrivateRoute>
              <SensorHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTE_PATH.MAINTENANCE_APPROVAL}
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <MaintenanceApprovalPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTE_PATH.REPORT_DEVICE_STATUS}
          element={
            <PrivateRoute>
              <DeviceStatusPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTE_PATH.REPORT_WARNING_INDICATOR}
          element={
            <PrivateRoute>
              <WarningIndicatorPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTE_PATH.USER_MANAGEMENT}
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <UserManagementPage />
            </PrivateRoute>
          }
        />
        <Route path="/not-found" element={<NoPermissionPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
