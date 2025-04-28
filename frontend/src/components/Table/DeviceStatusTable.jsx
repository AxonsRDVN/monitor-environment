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

export default function DeviceStatusTabel({ sensors }) {
  let stt = 1;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell>STT</TableCell>
            <TableCell>Tên trạm</TableCell>
            <TableCell>Model thiết bị</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Hành động</TableCell>
            <TableCell>Ngày bảo trì gần nhất</TableCell>
            <TableCell>Ngày phải hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors?.map((sensor) => (
            <TableRow key={sensor.id}>
              <TableCell>{stt++}</TableCell>
              <TableCell>{sensor.station_name || "-"}</TableCell>
              <TableCell>{sensor.model_sensor || "-"}</TableCell>
              <TableCell>Còn {sensor.remaining_days} ngày</TableCell>
              <TableCell>{sensor.action}</TableCell>
              <TableCell>{sensor.last_maintenance_date || "-"}</TableCell>
              <TableCell>{sensor.action_due_date || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
