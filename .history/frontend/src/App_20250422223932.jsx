import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATH } from "./config/router.config";
import { LoginPage } from "./page";
import Test from "./page/Test/Test";
import "@fontsource/ibm-plex-sans";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Test />} />
        <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
