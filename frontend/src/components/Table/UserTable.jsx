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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
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
  const { t } = useTranslation("translation");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let stt = 1;

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

  if (isSmallScreen) {
    return (
      <Stack spacing={2}>
        {users.map((user) => (
          <Card key={user.id} variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={700}>{t("index")}:</Typography>
                <Typography>{stt++}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={700}>{t("login_email")}:</Typography>
                <Typography>{user.username}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={700}>{t("full_name")}:</Typography>
                <Typography>{user.full_name}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={700}>{t("Email")}:</Typography>
                <Typography>{user.email}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={700}>{t("role")}:</Typography>
                <Typography>{t(getRoleName(user.role))}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={700}>{t("access_count")}:</Typography>
                <Typography>{user.access_times || 0}</Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={700}>{t("status")}:</Typography>
                {user.is_active ? (
                  <ToggleOn sx={{ color: "#22AB68", fontSize: 32 }} />
                ) : (
                  <ToggleOff sx={{ color: "#c7c7c7", fontSize: 32 }} />
                )}
              </Box>
              <Box mt={1} display="flex" justifyContent="flex-end" gap={1}>
                <IconButton color="primary" onClick={() => onEdit(user)}>
                  <EditIcon />
                </IconButton>
                {currentUserRole === "Admin" && (
                  <IconButton color="error" onClick={() => onDelete(user)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // ✅ Desktop: bảng như cũ
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#DEEDFE" }}>
          <TableRow>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("index")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("login_email")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("full_name")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("Email")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("role")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
              {t("access_count")}
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: "#0A6EE1", fontWeight: 600 }}
            >
              {t("status")}
            </TableCell>
            <TableCell sx={{ color: "#0A6EE1", fontWeight: 600 }}>
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
                  <ToggleOn sx={{ color: "#22AB68", fontSize: 40 }} />
                ) : (
                  <ToggleOff sx={{ color: "#c7c7c7", fontSize: 40 }} />
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
