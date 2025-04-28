import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";

export default function GeneralWarningIndicatorTable({ sensors }) {
  let stt = 1; // 🆕 Khởi tạo số thứ tự
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#E0F2FE" }}>
            <TableCell
              sx={{ fontWeight: "bold", color: "#0A6EE1", textAlign: "center" }}
            >
              STT
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#0A6EE1" }}>
              Trạm
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "#0A6EE1" }}>
              Chỉ số
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", color: "#0A6EE1", textAlign: "center" }}
            >
              Warning Count
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", color: "#0A6EE1", textAlign: "center" }}
            >
              Danger Count
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors.map((station) =>
            Object.entries(station.warning).map(([paramName, counts]) => (
              <TableRow
                key={`${station.id}-${paramName}`}
                sx={{
                  "&:hover": {
                    backgroundColor: "#F9FAFB",
                  },
                }}
              >
                <TableCell sx={{ textAlign: "center" }}>{stt++}</TableCell>{" "}
                {/* 🆕 Hiển thị và tăng STT */}
                <TableCell>{station.name}</TableCell>
                <TableCell sx={{}}>{paramName}</TableCell>
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
