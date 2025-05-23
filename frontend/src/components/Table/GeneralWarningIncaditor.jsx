import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function GeneralWarningIndicatorTable({ sensors }) {
  const { t } = useTranslation("translation");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  let stt = 1;

  if (isSmallScreen) {
    return (
      <Stack spacing={2}>
        {sensors.map((station) =>
          Object.entries(station.warning).map(([paramName, counts]) => (
            <Card key={`${station.id}-${paramName}`} variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={700}>{t("index")}:</Typography>
                    <Typography>{stt++}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={700}>{t("station")}:</Typography>
                    <Typography>{station.name}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={700}>{t("indicator")}:</Typography>
                    <Typography>{t(paramName)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={700}>
                      {t("warning_count")}:
                    </Typography>
                    <Typography
                      sx={{
                        color: counts.warning_count > 0 ? "#F59E0B" : "inherit",
                      }}
                    >
                      {counts.warning_count}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={700}>
                      {t("danger_count")}:
                    </Typography>
                    <Typography
                      sx={{
                        color: counts.danger_count > 0 ? "#EF4444" : "inherit",
                      }}
                    >
                      {counts.danger_count}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    );
  }

  // ✅ Bảng cho màn hình lớn
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#E0F2FE" }}>
            <TableCell
              sx={{ fontWeight: "bold", color: "#0A6EE1", textAlign: "center" }}
            >
              {t("index")}
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", color: "#0A6EE1", textAlign: "center" }}
            >
              {t("station")}
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", color: "#0A6EE1", textAlign: "center" }}
            >
              {t("indicator")}
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", color: "#0A6EE1", textAlign: "center" }}
            >
              {t("warning_count")}
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", color: "#0A6EE1", textAlign: "center" }}
            >
              {t("danger_count")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors.map((station) =>
            Object.entries(station.warning).map(([paramName, counts]) => (
              <TableRow
                key={`${station.id}-${paramName}`}
                sx={{ "&:hover": { backgroundColor: "#F9FAFB" } }}
              >
                <TableCell sx={{ textAlign: "center" }}>{stt++}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {station.name}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {t(paramName)}
                </TableCell>
                <TableCell
                  sx={{
                    color: counts.warning_count > 0 ? "#F59E0B" : "inherit",
                    textAlign: "center",
                  }}
                >
                  {counts.warning_count}
                </TableCell>
                <TableCell
                  sx={{
                    color: counts.danger_count > 0 ? "#EF4444" : "inherit",
                    textAlign: "center",
                  }}
                >
                  {counts.danger_count}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
