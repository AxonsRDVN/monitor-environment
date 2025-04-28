import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const linkStyle = {
  fontSize: 16,
  fontWeight: 500,
  color: "#074E9F",
  cursor: "pointer",
};

const lastItemStyle = {
  fontSize: 16,
  fontWeight: 500,
  color: "#344054", // Màu cho item cuối
};

const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();

  return (
    <Breadcrumbs separator="›" aria-label="Breadcrumb">
      {items.map((item, index) =>
        index < items.length - 1 ? (
          <Link
            key={index}
            underline="hover"
            onClick={() => navigate(item.path)}
            sx={linkStyle}
          >
            {item.label}
          </Link>
        ) : (
          <Typography key={index} sx={lastItemStyle}>
            {item.label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  );
};

export default Breadcrumb;
