import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATH } from "./config/router.config";
import {
  CleaningDayPage,
  HomePage,
  LoginPage,
  ParameterDetailPage,
  StationDetailIndexPage,
  StationStatusPage,
  WarningThresholdPage,
} from "./page";
import "@fontsource/ibm-plex-sans";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />
        <Route path={ROUTE_PATH.HOME || ""} element={<HomePage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
