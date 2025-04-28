// index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./index.css";
import { AppProvider } from "./context/AppContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Thêm dòng này
import "./i18n/i18n.js";
import { ErrorProvider } from "./context/ErrorContext.jsx";

const theme = createTheme();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <AppProvider>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </AppProvider>
  </ThemeProvider>
);
