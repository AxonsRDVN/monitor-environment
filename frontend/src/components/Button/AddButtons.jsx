import React from "react";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";

export default function AddButton({ onClick, addText }) {
  return (
    <Button
      variant="contained"
      startIcon={<Add />}
      onClick={onClick}
      sx={{
        background: "#074E9F",
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
        px: 3,
        py: 1,
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(7, 78, 159, 0.3)",
          transform: "translateY(-2px)", // tạo cảm giác nổi lên
        },
      }}
    >
      {addText}
    </Button>
  );
}
