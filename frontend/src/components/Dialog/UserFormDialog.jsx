import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function UserFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    role: "User",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        username: "",
        full_name: "",
        email: "",
        role: "User",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {initialData ? "Sửa Người Dùng" : "Thêm Người Dùng"}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        <TextField
          label="Họ và tên"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <FormControl fullWidth>
          <InputLabel>Vai trò</InputLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            label="Vai trò"
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? "Cập nhật" : "Thêm mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
