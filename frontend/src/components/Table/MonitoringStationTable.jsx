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
  let stt = 1;
  const { t } = useTranslation("translation");

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
              {/* Row Master */}
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

              {/* Row các Station con */}
              {master.stations &&
                master.stations.map((station) => (
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
                      <IconButton
                        color="primary"
                        onClick={() => onEdit(station)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => onDelete(station)}
                      >
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
