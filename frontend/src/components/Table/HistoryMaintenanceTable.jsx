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
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTranslation } from "react-i18next";

export default function HistoryMaintenanceTable({ sensor, onViewLocation }) {
  const { t } = useTranslation("translation");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  let stt = 1;

  if (isSmallScreen) {
    return (
      <Stack spacing={2}>
        {sensor.map((item) => (
          <Card key={item.id} variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("index")}:</Typography>
                  <Typography>{stt++}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("datetime")}:</Typography>
                  <Typography>
                    {new Date(item.update_at).toLocaleString()}
                  </Typography>
                </Box>

                {/* Ảnh */}
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("before_image")}:</Typography>
                  {item.image_before ? (
                    <img
                      src={
                        item.image_before.startsWith("http")
                          ? item.image_before
                          : `${API_BASE_URL}${item.image_before}`
                      }
                      alt="before"
                      style={{ width: 100, height: 100, objectFit: "cover" }}
                    />
                  ) : (
                    <Typography>-</Typography>
                  )}
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("after_image")}:</Typography>
                  {item.image_after ? (
                    <img
                      src={
                        item.image_after.startsWith("http")
                          ? item.image_after
                          : `${API_BASE_URL}${item.image_after}`
                      }
                      alt="after"
                      style={{ width: 100, height: 100, objectFit: "cover" }}
                    />
                  ) : (
                    <Typography>-</Typography>
                  )}
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("username")}:</Typography>
                  <Typography>{item.user_name || "-"}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("action")}:</Typography>
                  <Typography>
                    {item.action === "maintenance"
                      ? t("maintenance")
                      : t("replacement")}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("status")}:</Typography>
                  <Chip
                    size="small"
                    label={
                      item.status === "pending"
                        ? t("pending")
                        : item.status === "approved"
                        ? t("approved")
                        : t("rejected")
                    }
                    color={
                      item.status === "pending"
                        ? "warning"
                        : item.status === "approved"
                        ? "success"
                        : "error"
                    }
                  />
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("moderator")}:</Typography>
                  <Typography>{item.moderator || "-"}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("role")}:</Typography>
                  <Typography>{item.role || "-"}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={500}>{t("coordinate")}:</Typography>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onViewLocation(item.latitude, item.longitude)
                    }
                    disabled={!item.latitude || !item.longitude}
                  >
                    <LocationOnIcon />
                  </IconButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // ✅ Màn hình lớn: giữ nguyên bảng
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
        <TableHead sx={{ background: "#DEEDFE", color: "#0A6EE1" }}>
          <TableRow>
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
              <TableCell>
                {item.image_before ? (
                  <img
                    src={
                      item.image_before.startsWith("http")
                        ? item.image_before
                        : `${API_BASE_URL}${item.image_before}`
                    }
                    alt="before"
                    style={{ width: 50, height: "auto" }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {item.image_after ? (
                  <img
                    src={
                      item.image_after.startsWith("http")
                        ? item.image_after
                        : `${API_BASE_URL}${item.image_after}`
                    }
                    alt="after"
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
