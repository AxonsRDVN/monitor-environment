import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  const showError = (message) => {
    setError(message);
  };

  const handleClose = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity="error" onClose={handleClose}>
          {error}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}
