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

export default function UserTable({
  users,
  onEdit,
  onDelete,
  currentUserRole,
}) {
  let stt = 1;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell>STT</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Họ tên</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Vai trò</TableCell>
            <TableCell>Lượt truy cập</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{stt++}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.session_time}</TableCell>
              <TableCell>
                {user.is_active ? (
                  <Chip label="Đang hoạt động" color="success" />
                ) : (
                  <Chip label="Ngừng hoạt động" color="default" />
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
