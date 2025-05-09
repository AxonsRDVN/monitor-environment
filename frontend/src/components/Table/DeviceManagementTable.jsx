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
} from "@mui/material";
import { BuildOutlined, SettingsBackupRestore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export default function DeviceManagementTable({
  sensors,
  onMaintenance,
  onHistory,
}) {
  const { t } = useTranslation("translation");
  let stt = 1;
  const API_BASE_URL = process.env.REACT_APP_API_URL; // hoặc lấy từ biến môi trường
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead
          color="primary"
          sx={{ background: "#DEEDFE", color: "#0A6EE1" }}
        >
          <TableRow
            color="primary"
            sx={{ background: "#DEEDFE", color: "#0A6EE1" }}
          >
            <TableCell sx={{ color: "#0A6EE1" }}>{t("index")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("device_model")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("device_image")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("expiry_date")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>
              {t("current_lifespan")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("start_date")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>
              {t("last_maintenance")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>
              {t("next_maintenance")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("delayed_days")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("action")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors.map((sensor) => (
            <React.Fragment key={sensor.id}>
              <TableRow>
                <TableCell
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {stt++}
                </TableCell>
                <TableCell
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {sensor.model_sensor || "-"}
                </TableCell>
                <TableCell>
                  <img
                    src={
                      sensor.image.startsWith("http")
                        ? sensor.image
                        : `${API_BASE_URL}${sensor.image}`
                    }
                    alt={sensor.model_sensor}
                    style={{ width: 35, height: 35, objectFit: "cover" }}
                  />
                </TableCell>
                <TableCell>{sensor.expiry || "-"}</TableCell>
                <TableCell>{sensor.longevity || "-"}</TableCell>
                <TableCell>{sensor.create_at || "-"}</TableCell>
                <TableCell>{sensor.create_at || "-"}</TableCell>
                <TableCell>{sensor.create_at || "-"}</TableCell>
                <TableCell>{sensor.expiry || "-"}</TableCell>
                <TableCell sx={{ display: "flex" }}>
                  <IconButton
                    color="primary"
                    onClick={() => onMaintenance(sensor)}
                  >
                    <BuildOutlined />
                  </IconButton>
                  <IconButton color="primary" onClick={() => onHistory(sensor)}>
                    <SettingsBackupRestore />
                  </IconButton>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
