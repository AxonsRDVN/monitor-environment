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
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { ContentPasteSearchOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export default function MaintenanceApprovalTable({
  sensors,
  onViewDetail,
  onViewLocation,
}) {
  const { t } = useTranslation("translation");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let stt = 1;

  if (isSmallScreen) {
    return (
      <Stack spacing={2}>
        {sensors.map((sensor) => (
          <Card key={sensor.id} variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("index")}:</Typography>
                  <Typography>{stt++}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("device_model")}:</Typography>
                  <Typography
                    sx={{ wordBreak: "break-word", color: "text.secondary" }}
                  >
                    {sensor.sensor_model || "-"}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("station_name")}:</Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {sensor.station_name || "-"}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("location")}:</Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {sensor.station_location || "-"}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("username")}:</Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {sensor.user_name || "-"}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("action")}:</Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {sensor.action === "maintenance"
                      ? t("maintenance")
                      : t("replacement")}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("coordinate")}:</Typography>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onViewLocation(sensor.latitude, sensor.longitude)
                    }
                    disabled={!sensor.latitude || !sensor.longitude}
                  >
                    <LocationOnIcon />
                  </IconButton>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("details")}:</Typography>
                  <IconButton
                    color="primary"
                    onClick={() => onViewDetail(sensor.id)}
                  >
                    <ContentPasteSearchOutlined />
                  </IconButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // ✅ Màn hình lớn: giữ nguyên dạng bảng
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
