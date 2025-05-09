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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { ContentPasteSearchOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export default function MaintenanceApprovalTabel({
  sensors,
  onViewDetail,
  onViewLocation,
}) {
  const { t } = useTranslation("translation");
  let stt = 1;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("index")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("device_model")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("station_name")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("location")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("username")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("action")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("coordinate")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("details")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors.map((sensor) => (
            <TableRow key={sensor.id}>
              <TableCell>{stt++}</TableCell>
              <TableCell>{sensor.sensor_model || "-"}</TableCell>
              <TableCell>{sensor.station_name || "-"}</TableCell>
              <TableCell>{sensor.station_location || "-"}</TableCell>
              <TableCell>{sensor.user_name || "-"}</TableCell>
              <TableCell>
                {sensor.action === "maintenance"
                  ? t("maintenance")
                  : t("replacement")}
              </TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() =>
                    onViewLocation(sensor.latitude, sensor.longitude)
                  }
                  disabled={!sensor.latitude || !sensor.longitude}
                >
                  <LocationOnIcon />
                </IconButton>
              </TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => onViewDetail(sensor.id)}
                >
                  <ContentPasteSearchOutlined />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
