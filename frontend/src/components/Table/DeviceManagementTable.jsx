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
  Divider,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { BuildOutlined, SettingsBackupRestore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export default function DeviceManagementTable({
  sensors,
  onMaintenance,
  onHistory,
}) {
  const { t } = useTranslation("translation");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  let stt = 1;

  if (isSmallScreen) {
    return (
      <Stack spacing={2}>
        {sensors.map((sensor, index) => {
          const today = new Date();
          const cleanDate = new Date(sensor.day_clean);
          const diffDays = Math.ceil(
            (today - cleanDate) / (1000 * 60 * 60 * 24)
          );
          const delayText =
            diffDays >= 0
              ? `${diffDays} ${t("day")}`
              : t("day_has_not_come_or_not_update");

          return (
            <Card key={sensor.id} variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  {/* Label-value rows */}
                  {[
                    { label: t("index"), value: stt++ },
                    {
                      label: t("device_model"),
                      value: sensor.model_sensor || "-",
                    },
                    {
                      label: t("expiry_date"),
                      value: `${sensor.expiry || "-"} ${t("month")}`,
                    },
                    {
                      label: t("current_lifespan"),
                      value: `${sensor.longevity} ${t("day")}`,
                    },
                    {
                      label: t("last_replacement"),
                      value: sensor.create_at || "-",
                    },
                    {
                      label: t("last_maintenance"),
                      value: sensor.maintenance_date || "-",
                    },
                    {
                      label: t("next_maintenance"),
                      value: sensor.day_clean || "-",
                    },
                    {
                      label: t("delayed_days"),
                      value: delayText,
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography
                        fontWeight={500}
                        sx={{ flex: "0 0 auto", mr: 1 }}
                      >
                        {item.label}:
                      </Typography>
                      <Typography
                        sx={{
                          flex: "1 1 0",
                          wordBreak: "break-word",
                          textAlign: "right",
                          color: "text.secondary",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                  {/* Image row */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography
                      fontWeight={500}
                      sx={{ flex: "0 0 auto", mr: 1 }}
                    >
                      {t("device_image")}:
                    </Typography>

                    <Box sx={{ flex: "1 1 0", textAlign: "right" }}>
                      <img
                        src={
                          sensor.image?.startsWith("http")
                            ? sensor.image
                            : `${API_BASE_URL}${sensor.image}`
                        }
                        alt={sensor.model_sensor}
                        style={{ width: 100, height: 100, objectFit: "cover" }}
                      />
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    mt={1}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => onMaintenance(sensor)}
                    >
                      <BuildOutlined />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => onHistory(sensor)}
                    >
                      <SettingsBackupRestore />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  }

  // ✅ Màn hình lớn: giữ nguyên bảng cũ
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("index")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("device_model")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("device_image")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("expiry_date")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>
              {t("current_lifespan")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>
              {t("last_replacement")}
            </TableCell>
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
          {sensors.map((sensor) => {
            const today = new Date();
            const cleanDate = new Date(sensor.day_clean);
            const diffDays = Math.ceil(
              (today - cleanDate) / (1000 * 60 * 60 * 24)
            );
            const delayText =
              diffDays >= 0
                ? `${diffDays} ${t("day")}`
                : t("day_has_not_come_or_not_update");

            return (
              <TableRow key={sensor.id}>
                <TableCell>{stt++}</TableCell>
                <TableCell>{sensor.model_sensor || "-"}</TableCell>
                <TableCell>
                  <img
                    src={
                      sensor.image?.startsWith("http")
                        ? sensor.image
                        : `${API_BASE_URL}${sensor.image}`
                    }
                    alt={sensor.model_sensor}
                    style={{ width: 35, height: 35, objectFit: "cover" }}
                  />
                </TableCell>
                <TableCell>
                  {sensor.expiry || "-"} {t("month")}
                </TableCell>
                <TableCell>
                  {sensor.longevity} {t("day")}
                </TableCell>
                <TableCell>{sensor.create_at || "-"}</TableCell>
                <TableCell>{sensor.maintenance_date || "-"}</TableCell>
                <TableCell>{sensor.day_clean || "-"}</TableCell>
                <TableCell>{delayText}</TableCell>
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
