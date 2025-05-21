import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  InputAdornment,
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
import { Search } from "@mui/icons-material";
import axios from "axios";
import UserTable from "../Table/UserTable";
import UserFormDialog from "../Dialog/UserFormDialog";
import AddButton from "../Button/AddButtons";
import { t } from "i18next";

const API_BASE = process.env.REACT_APP_API_URL;

export default function UserManagement() {
  const { t } = useTranslation("translation");
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
      plants: data.plants, // ✅ thêm dòng này
      is_active: data.is_active,
    };

    try {
      if (selectedUser) {
        // await axios.patch(
        //   `${API_BASE}/monitor-environment/user/${selectedUser.id}/`,
        //   payload
        // );
        await axios.put(
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
        items={[{ label: t("user_management"), path: "/user-management" }]}
      />
      <PageTitle title={t("user_management")} />
      <PageContent>
        <Box display="flex" justifyContent="space-between" mb={4}>
          <FormControl>
            <InputLabel>{t("search_user")}</InputLabel>
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
          <AddButton onClick={handleAdd} addText={t("add_new")} />
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
