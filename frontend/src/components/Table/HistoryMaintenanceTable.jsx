import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTranslation } from "react-i18next";

export default function HistoryMaintenanceTable({ sensor, onViewLocation }) {
  const { t } = useTranslation("translation");
  let stt = 1;
  const API_BASE_URL = process.env.REACT_APP_API_URL; // hoặc lấy từ biến môi trường

  return (
    <TableContainer component={Paper}>
      <Table
        sx={{
          maxWidth: "100%",
          "& td": {
            whiteSpace: "normal",
            wordBreak: "break-word",
          },
        }}
      >
        <TableHead
          color="primary"
          sx={{ background: "#DEEDFE", color: "#0A6EE1" }}
        >
          <TableRow
            color="primary"
            sx={{ background: "#DEEDFE", color: "#0A6EE1" }}
          >
            <TableCell sx={{ color: "#0A6EE1" }}>{t("index")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("datetime")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("before_image")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("after_image")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("username")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("action")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("status")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("moderator")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("role")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("coordinate")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensor.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{stt++}</TableCell>
              <TableCell>{new Date(item.update_at).toLocaleString()}</TableCell>

              {/* Ảnh trước bảo trì */}
              <TableCell>
                {item.image_before ? (
                  <img
                    src={
                      item.image_before.startsWith("http")
                        ? item.image_before
                        : `${API_BASE_URL}${item.image_before}`
                    }
                    alt={item.image_before}
                    style={{ width: 50, height: "auto" }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Ảnh sau bảo trì */}
              <TableCell>
                {item.image_after ? (
                  <img
                    src={
                      item.image_after.startsWith("http")
                        ? item.image_after
                        : `${API_BASE_URL}${item.image_after}`
                    }
                    alt={item.image_after}
                    style={{ width: 50, height: "auto" }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>

              <TableCell>{item.user_name || "-"}</TableCell>

              <TableCell>
                {item.action === "maintenance"
                  ? t("maintenance")
                  : t("replacement")}
              </TableCell>

              <TableCell>
                {item.status === "pending" ? (
                  <Chip label={t("pending")} color="warning" size="small" />
                ) : item.status === "approved" ? (
                  <Chip label={t("approved")} color="success" size="small" />
                ) : (
                  <Chip label={t("rejected")} color="error" size="small" />
                )}
              </TableCell>

              <TableCell>{item.moderator || "-"}</TableCell>
              <TableCell>{item.role || "-"}</TableCell>

              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => onViewLocation(item.latitude, item.longitude)}
                  disabled={!item.latitude || !item.longitude}
                >
                  <LocationOnIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
