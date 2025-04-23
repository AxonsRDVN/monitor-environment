import React from "react";
import { Box, useMediaQuery } from "@mui/material";

const PageContainer = ({ children }) => {
  const isLargeScreen = useMediaQuery("(min-width:1050px)");

  return (
    <Box
      sx={{
        marginLeft: isLargeScreen ? "280px" : 0,
        padding: {
          xs: "16px",
          sm: "32px",
        },
        minHeight: "100vh",
        backgroundColor: "#F8F9FA",
        transition: "margin-left 0.3s ease",
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer;
