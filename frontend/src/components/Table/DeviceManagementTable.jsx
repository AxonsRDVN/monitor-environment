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
import { BuildOutlined, SettingsBackupRestore } from "@mui/icons-material";

export default function DeviceManagementTable({
  sensors,
  onMaintenance,
  onHistory,
}) {
  let stt = 1;
  const API_BASE_URL = process.env.REACT_APP_API_URL; // hoặc lấy từ biến môi trường
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
            <TableCell>STT</TableCell>
            <TableCell>Model thiết bị</TableCell>
            <TableCell>Hình thiết bị</TableCell>
            <TableCell>Hạn sử dụng</TableCell>
            <TableCell>Tuổi thọ hiện tại</TableCell>
            <TableCell>Ngày khởi động</TableCell>
            <TableCell>Bảo trì gần nhất</TableCell>
            <TableCell>Bảo trì kế tiếp</TableCell>
            <TableCell>Ngày trễ</TableCell>
            <TableCell>Tính năng</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors.map((sensor) => (
            <React.Fragment key={sensor.id}>
              <TableRow>
                <TableCell
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {stt++}
                </TableCell>
                <TableCell
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {sensor.model_sensor || "-"}
                </TableCell>
                <TableCell>
                  <img
                    src={
                      sensor.image.startsWith("http")
                        ? sensor.image
                        : `${API_BASE_URL}${sensor.image}`
                    }
                    alt={sensor.model_sensor}
                    style={{ width: 35, height: 35, objectFit: "cover" }}
                  />
                </TableCell>
                <TableCell>{sensor.expiry || "-"}</TableCell>
                <TableCell>{sensor.longevity || "-"}</TableCell>
                <TableCell>{sensor.create_at || "-"}</TableCell>
                <TableCell>{sensor.create_at || "-"}</TableCell>
                <TableCell>{sensor.create_at || "-"}</TableCell>
                <TableCell>{sensor.expiry || "-"}</TableCell>
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
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
