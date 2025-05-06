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
  FormControl,
  OutlinedInput,
  InputLabel,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import SearchIcon from "@mui/icons-material/Search";
import { Router, Search, Sensors } from "@mui/icons-material";
import PieChartWithNeedle from "../Chart/PieChartWithNeedle";
import LineChartHorizontal from "../Chart/LineChartHorizontal";
import StatusIcon from "../Icon/StatusIcon";
import ExportChartButton from "../Button/ButtonSave";
import { statusColors } from "../Icon/ParameterIcon";
import { useError } from "../../context/ErrorContext";
import axios from "axios";
import UserTable from "../Table/UserTable";
import UserFormDialog from "../Dialog/UserFormDialog";
import AddButton from "../Button/AddButtons";

const API_BASE = process.env.REACT_APP_API_URL;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const currentUserRole = "Admin"; // 🧠 TODO: lấy từ context đăng nhập thực tế
  const [errors, setErrors] = useState({});

  const getRoleId = (roleName) => {
    switch (roleName) {
      case "admin":
        return 1;
      case "manager":
        return 2;
      case "user":
        return 3;
      default:
        return null;
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/monitor-environment/user/`);
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

  console.log(selectedUser);

  const handleDelete = async (user) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng ${user.username}?`)) {
      try {
        await axios.delete(`${API_BASE}/monitor-environment/user/${user.id}/`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSubmit = async (data) => {
    const payload = {
      username: data.username,
      password: data.password,
      full_name: data.full_name,
      email: data.email,
      phone_number: data.phone_number,
      address: data.address,
      gender: data.gender.toLowerCase(),
      date_of_birth: data.date_of_birth,
      role: getRoleId(data.role),
    };

    try {
      if (selectedUser) {
        await axios.patch(
          `${API_BASE}/monitor-environment/user/${selectedUser.id}/`,
          payload
        );
      } else {
        await axios.post(`${API_BASE}/monitor-environment/user/`, payload);
      }
      fetchUsers();
      return { success: true };
    } catch (error) {
      return { success: false, errors: error.response?.data || {} };
    }
  };

  const filteredUsers = users.filter((user) =>
    [user.username, user.full_name, user.email]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Quản lý người dùng", path: "/user-management" }]}
      />
      <PageTitle title="Quản lý người dùng" />
      <PageContent>
        <Box display="flex" justifyContent="space-between" mb={4}>
          <FormControl>
            <InputLabel>Tìm kiếm người dùng</InputLabel>
            <OutlinedInput
              startAdornment={
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              }
              label="Tìm kiếm người dùng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>
          <AddButton onClick={handleAdd} />
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <UserTable
            users={filteredUsers}
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
