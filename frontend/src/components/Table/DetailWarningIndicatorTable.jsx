import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export default function DetailWarningIndicatorTable({ dataApi }) {
  const { t } = useTranslation("translation");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let stt = 1;

  if (isSmallScreen) {
    return (
      <Stack spacing={2}>
        {dataApi?.map((data) => (
          <Card key={data.id} variant="outlined">
            <CardContent>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>{t("index")}:</Typography>
                  <Typography>{stt++}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>{t("station")}:</Typography>
                  <Typography>{data.station_name || "-"}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>{t("indicator")}:</Typography>
                  <Typography>{t(data.parameter_name) || "-"}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>{t("value")}:</Typography>
                  <Typography>
                    {data.value} {data.unit}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>{t("status")}:</Typography>
                  <Typography>
                    {" "}
                    <Box
                      component="span"
                      sx={{
                        padding: "2px 10px",
                        backgroundColor:
                          data.status === "danger" ? "#F8E5E5" : "#FEF3E5",
                        color: data.status === "danger" ? "#C2281D" : "#DD8108",
                        borderRadius: "999px",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      {data.status === "danger" ? t("danger") : t("caution")}
                    </Box>
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>
                    {t("report_table_column_time")}:
                  </Typography>
                  <Typography>
                    {data.time
                      ? dayjs(data.time).format("DD/MM/YYYY HH:mm:ss")
                      : "-"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // ✅ Màn lớn giữ nguyên bảng
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("index")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("station")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("indicator")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("value")}
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: 600, textAlign: "center" }}
            >
              {t("status")}
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: 600, textAlign: "center" }}
            >
              {t("report_table_column_time")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataApi?.map((data) => (
            <TableRow key={data.id}>
              <TableCell>{stt++}</TableCell>
              <TableCell>{data.station_name || "-"}</TableCell>
              <TableCell>{t(data.parameter_name) || "-"}</TableCell>
              <TableCell>
                {data.value} {data.unit}
              </TableCell>
              <TableCell align="center">
                <Box
                  sx={{
                    display: "inline-block",
                    padding: "4px 12px",
                    backgroundColor:
                      data.status === "danger" ? "#F8E5E5" : "#FEF3E5",
                    color: data.status === "danger" ? "#C2281D" : "#DD8108",
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {data.status === "danger" ? t("danger") : t("caution")}
                </Box>
              </TableCell>
              <TableCell align="center">
                {data.time
                  ? dayjs(data.time).format("DD/MM/YYYY HH:mm:ss")
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
