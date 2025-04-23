import React from "react";
import { Typography, Box } from "@mui/material";

const PageTitle = ({ title }) => {
  return (
    <Box sx={{ padding: "28px 0" }}>
      <Typography
        sx={{
          fontWeight: 700,
          color: "#344054",
          textTransform: "capitalize",
          fontSize: "32px",
          lineHeight: "24px",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default PageTitle;
