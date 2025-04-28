import React from "react";
import { Button } from "@mui/material";
import { SystemUpdateAlt } from "@mui/icons-material";

export default function ExportButton({ onClick, text = "Export" }) {
  return (
    <Button
      variant="contained"
      startIcon={<SystemUpdateAlt />}
      onClick={onClick}
      sx={{
        background: "#ffffff",
        borderRadius: "8px",
        textTransform: "none",
        color: "#074E9F",
        fontWeight: 600,
        px: 3,
        py: 1,
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(7, 78, 159, 0.3)",
          transform: "translateY(-2px)", // tạo cảm giác nổi lên
          color: "#ffffff",
          background: "",
        },
      }}
    >
      {text}
    </Button>
  );
}
