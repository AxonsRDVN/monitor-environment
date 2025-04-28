import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllStationsByPlant } from "../../api/stationApi";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  InputAdornment,
  Button,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../BreadCrumb/Breadcrumb";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import SearchIcon from "@mui/icons-material/Search";
import { Router, Sensors } from "@mui/icons-material";
import PieChartWithNeedle from "../Chart/PieChartWithNeedle";
import LineChartHorizontal from "../Chart/LineChartHorizontal";
import StatusIcon from "../Icon/StatusIcon";
import ExportChartButton from "../Button/ButtonSave";
import { statusColors } from "../Icon/ParameterIcon";
import { useError } from "../../context/ErrorContext";
import axios from "axios";
import UserTable from "../Table/UserTable";
import UserFormDialog from "../Dialog/UserFormDialog";

const API_BASE = process.env.REACT_APP_API_URL;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const currentUserRole = "Admin"; // 🧠 TODO: lấy từ context đăng nhập thực tế

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/monitor-environment/users/`);
      setUsers(res.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng ${user.username}?`)) {
      try {
        await axios.delete(`${API_BASE}/monitor-environment/users/${user.id}/`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedUser) {
        await axios.patch(
          `${API_BASE}/monitor-environment/users/${selectedUser.id}/`,
          data
        );
      } else {
        await axios.post(`${API_BASE}/monitor-environment/users/`, data);
      }
      fetchUsers();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <PageContainer>
      <PageTitle title="Quản lý người dùng" />
      <PageContent>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Danh sách người dùng</Typography>
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Thêm người dùng
          </Button>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <UserTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUserRole={currentUserRole}
          />
        )}

        <UserFormDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSubmit={handleSubmit}
          initialData={selectedUser}
        />
      </PageContent>
    </PageContainer>
  );
}
