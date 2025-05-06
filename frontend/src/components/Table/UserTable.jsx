import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TableContainer,
  Paper,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToggleOff, ToggleOn } from "@mui/icons-material";

export default function UserTable({
  users,
  onEdit,
  onDelete,
  currentUserRole,
}) {
  let stt = 1;
  const getRoleName = (id) => {
    switch (id) {
      case 1:
        return "Admin";
      case 2:
        return "Manager";
      case 3:
        return "User";
      default:
        return "";
    }
  };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: 16 }}
            >
              STT
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: 16 }}
            >
              Username
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: 16 }}
            >
              Họ tên
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: 16 }}
            >
              Email
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: 16 }}
            >
              Vai trò
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: 16 }}
            >
              Lượt truy cập
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: 16 }}
            >
              Trạng thái
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: 16 }}
            >
              Hành động
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{stt++}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleName(user.role)}</TableCell>
              <TableCell>{user.session_time}</TableCell>
              <TableCell align="center">
                {user.is_active ? (
                  <ToggleOn sx={{ color: "#22AB68", fontSize: 50 }} />
                ) : (
                  <ToggleOff sx={{ color: "#c7c7c7", fontSize: 50 }} />
                )}
              </TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => onEdit(user)}>
                  <EditIcon />
                </IconButton>
                {currentUserRole === "Admin" && (
                  <IconButton color="error" onClick={() => onDelete(user)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
