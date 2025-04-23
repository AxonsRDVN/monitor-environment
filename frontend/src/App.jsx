import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATH } from "./config/router.config";
import { HomePage, LoginPage, StationStatusPage } from "./page";
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
