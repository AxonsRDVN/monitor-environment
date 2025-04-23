import React from "react";
import { Box } from "@mui/material";

const PageContent = ({ children, sx = {} }) => {
  return (
    <Box
      sx={{
        padding: {
          xs: "0",
          sm: "32px",
        },
        backgroundColor: "#ffffff",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default PageContent;
