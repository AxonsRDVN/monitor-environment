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
  Typography,
  Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function HistoryMaintenanceTable({ sensor, onViewLocation }) {
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
            <TableCell>Ngày giờ</TableCell>
            <TableCell>Ảnh trước</TableCell>
            <TableCell>Ảnh sau</TableCell>
            <TableCell>Tên người dùng</TableCell>
            <TableCell>Hành động</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Moderator</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Định vị</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensor.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{stt++}</TableCell>
              <TableCell>{new Date(item.update_at).toLocaleString()}</TableCell>

              {/* Ảnh trước bảo trì */}
              <TableCell>
                {item.image_before ? (
                  <img
                    src={
                      item.image_before.startsWith("http")
                        ? item.image_before
                        : `${API_BASE_URL}${item.image_before}`
                    }
                    alt={item.image_before}
                    style={{ width: 50, height: "auto" }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>

              {/* Ảnh sau bảo trì */}
              <TableCell>
                {item.image_after ? (
                  <img
                    src={
                      item.image_after.startsWith("http")
                        ? item.image_after
                        : `${API_BASE_URL}${item.image_after}`
                    }
                    alt={item.image_after}
                    style={{ width: 50, height: "auto" }}
                  />
                ) : (
                  "-"
                )}
              </TableCell>

              <TableCell>{item.user_name || "-"}</TableCell>

              <TableCell>
                {item.action === "maintenance" ? "Bảo trì" : "Thay thế"}
              </TableCell>

              <TableCell>
                {item.status === "pending" ? (
                  <Chip label="Chờ duyệt" color="warning" size="small" />
                ) : item.status === "approved" ? (
                  <Chip label="Đã duyệt" color="success" size="small" />
                ) : (
                  <Chip label="Hủy bỏ" color="error" size="small" />
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
