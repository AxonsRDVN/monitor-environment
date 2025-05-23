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
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTranslation } from "react-i18next";

export default function MonitoringStationTable({
  stations,
  onEdit,
  onDelete,
  onViewLocation,
}) {
  const { t } = useTranslation("translation");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let stt = 1;

  if (isSmallScreen) {
    return (
      <Stack spacing={2}>
        {stations.map((master) => (
          <React.Fragment key={master.id}>
            {/* Master Card */}
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 500 }}>Master</Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {master.name || "-"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 500 }}>
                    {t("location")}:
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {master.location || "-"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 500 }}>
                    {t("station_code")}:
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {master.code || "-"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 500 }}>
                    {t("channel")}:
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {master.channel || "-"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 500 }}>
                    {t("address")}:
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {master.address || "-"}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, justifyContent: "center" }}
                >
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onViewLocation(master.latitude, master.longitude)
                    }
                    disabled={!master.latitude || !master.longitude}
                  >
                    <LocationOnIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => onEdit(master)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete(master)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>

            {/* Station Cards */}
            {master.stations?.map((station) => (
              <Card variant="outlined">
                <CardContent>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>Station</Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      {station.name || "-"}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>
                      {t("location")}:
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      {station.location || "-"}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>
                      {t("station_code")}:
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      {station.code || "-"}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>
                      {t("channel")}:
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      {station.channel || "-"}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>
                      {t("address")}:
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      {station.address || "-"}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, justifyContent: "center" }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() =>
                        onViewLocation(station.latitude, station.longitude)
                      }
                      disabled={!station.latitude || !station.longitude}
                    >
                      <LocationOnIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => onEdit(station)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => onDelete(station)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </React.Fragment>
        ))}
      </Stack>
    );
  }

  // 👇 Màn hình lớn: hiển thị bảng như cũ
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("index")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("location")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("station_name")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("station_code")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("channel")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("address")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("coordinate")}</TableCell>
            <TableCell sx={{ color: "#0A6EE1" }}>{t("action")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stations.map((master) => (
            <React.Fragment key={master.id}>
              <TableRow>
                <TableCell>{stt++}</TableCell>
                <TableCell>{master.location || "-"}</TableCell>
                <TableCell>
                  <strong>(Master)</strong> {master.name}
                </TableCell>
                <TableCell>{master.code}</TableCell>
                <TableCell>{master.channel || "-"}</TableCell>
                <TableCell>{master.address || "-"}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onViewLocation(master.latitude, master.longitude)
                    }
                    disabled={!master.latitude || !master.longitude}
                  >
                    <LocationOnIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => onEdit(master)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete(master)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>

              {master.stations?.map((station) => (
                <TableRow key={station.id}>
                  <TableCell>{stt++}</TableCell>
                  <TableCell>{station.location || "-"}</TableCell>
                  <TableCell>
                    &nbsp;&nbsp;&nbsp;&nbsp;↳ (Station) {station.name}
                  </TableCell>
                  <TableCell>{station.code}</TableCell>
                  <TableCell>{station.channel || "-"}</TableCell>
                  <TableCell>{station.address || "-"}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        onViewLocation(station.latitude, station.longitude)
                      }
                      disabled={!station.latitude || !station.longitude}
                    >
                      <LocationOnIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => onEdit(station)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => onDelete(station)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
