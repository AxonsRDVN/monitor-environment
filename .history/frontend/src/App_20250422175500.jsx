import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
