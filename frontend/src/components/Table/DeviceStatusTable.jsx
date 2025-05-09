import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function DeviceStatusTabel({ sensors }) {
  const { t } = useTranslation("translation");

  let stt = 1;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("index")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("station_name")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("device_model")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("status")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("action")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>
              {t("last_maintenance")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("action_date")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors?.map((sensor) => (
            <TableRow key={sensor.id}>
              <TableCell>{stt++}</TableCell>
              <TableCell>{sensor.station_name || "-"}</TableCell>
              <TableCell>{sensor.model_sensor || "-"}</TableCell>
              <TableCell>
                {t("have_some_day", { count: sensor.remaining_days })}
              </TableCell>
              <TableCell>{t(sensor.action)}</TableCell>
              <TableCell>{sensor.last_maintenance_date || "-"}</TableCell>
              <TableCell>{sensor.action_due_date || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
