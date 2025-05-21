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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToggleOff, ToggleOn } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export default function UserTable({
  users,
  onEdit,
  onDelete,
  currentUserRole,
}) {
  let stt = 1;
  const { t } = useTranslation("translation");
  const getRoleName = (id) => {
    switch (id) {
      case 1:
        return "admin";
      case 2:
        return "user";
      case 3:
        return "manager";
      default:
        return "";
    }
  };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600, fontSize: 16 }}>
              {t("index")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600, fontSize: 16 }}>
              {t("login_email")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600, fontSize: 16 }}>
              {t("full_name")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600, fontSize: 16 }}>
              {t("Email")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600, fontSize: 16 }}>
              {t("role")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600, fontSize: 16 }}>
              {t("access_count")}
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: "#0A6EE1", fontWeight: 600, fontSize: 16 }}
            >
              {t("status")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600, fontSize: 16 }}>
              {t("action")}
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
              <TableCell>{t(getRoleName(user.role))}</TableCell>
              <TableCell align="center">{user.access_times || 0}</TableCell>
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
