import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATH } from "./config/router.config";
import { Login } from "./page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTE_PATH.LOGIN} element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
