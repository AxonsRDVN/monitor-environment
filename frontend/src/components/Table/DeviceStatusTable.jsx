import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  Card,
  Typography,
  CardContent,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function DeviceStatusTable({ sensors }) {
  const { t } = useTranslation("translation");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let stt = 1;

  if (isSmallScreen) {
    return (
      <Box>
        {sensors.map((sensor) => (
          <Card key={sensor.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography>
                <strong>{t("index")}:</strong> {stt++}
              </Typography>
              <Typography>
                <strong>{t("station_name")}:</strong>{" "}
                {sensor.station_name || "-"}
              </Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                <strong>{t("device_model")}:</strong>{" "}
                {sensor.model_sensor || "-"}
              </Typography>
              <Typography>
                <strong>{t("status")}:</strong>{" "}
                {t("have_some_day", { count: sensor.remaining_days })}
              </Typography>
              <Typography>
                <strong>{t("action")}:</strong> {t(sensor.action)}
              </Typography>
              <Typography>
                <strong>{t("last_maintenance")}:</strong>{" "}
                {sensor.last_maintenance_date || "-"}
              </Typography>
              <Typography>
                <strong>{t("action_date")}:</strong>{" "}
                {sensor.action_due_date || "-"}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // ✅ Màn hình lớn: giữ nguyên dạng bảng
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
          {sensors.map((sensor) => (
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
