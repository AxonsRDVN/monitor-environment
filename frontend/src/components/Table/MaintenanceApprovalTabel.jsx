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

export default function MaintenanceApprovalTabel({
  sensors,
  onViewDetail,
  onViewLocation,
}) {
  let stt = 1;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell>STT</TableCell>
            <TableCell>Model thiết bị</TableCell>
            <TableCell>Tên trạm</TableCell>
            <TableCell>Vị trí</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Hành động</TableCell>
            <TableCell>Định vị</TableCell>
            <TableCell>Chi tiết</TableCell>
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
                {sensor.action === "maintenance" ? "Bảo trì" : "Thay thế"}
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
