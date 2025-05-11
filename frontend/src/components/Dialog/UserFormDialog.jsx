import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Drawer,
  Typography,
  IconButton,
  Box,
  OutlinedInput,
  InputAdornment,
  Checkbox,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { getAllPlants } from "../../api/plantApi";
import { useError } from "../../context/ErrorContext";

const ROLES = {
  1: "admin",
  2: "user",
  3: "manager",
};

export default function UserFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const defaultFormData = {
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
    role: "user",
    gender: "Male",
    date_of_birth: dayjs().format("YYYY-MM-DD"),
    plants: [], // ✅ thêm dòng này
  };
  const { t } = useTranslation("translation");
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await getAllPlants();
        setPlants(res);
      } catch (err) {
        showError(showError(t("can_connect_to_server")));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, []);

  useEffect(() => {
    setFormData(
      initialData
        ? {
            ...defaultFormData,
            ...initialData,
            password: "", // Không hiển thị mật khẩu khi chỉnh sửa
            gender:
              initialData.gender?.toLowerCase() === "female"
                ? "Female"
                : "Male",
            role: ROLES[initialData.role],
            date_of_birth:
              initialData.date_of_birth || dayjs().format("YYYY-MM-DD"),
            plants: initialData.plants || [], // ✅ Gán giá trị đã phân quyền
          }
        : defaultFormData
    );
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      date_of_birth: newValue
        ? newValue.format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await onSubmit(formData);
      if (res?.errors) {
        setErrors(res.errors);
      } else {
        setErrors({});
        onClose();
      }
    } catch (err) {
      console.error("❌ Lỗi khi gửi dữ liệu:", err);
      setErrors(err.response?.data || {});
    }
  };

  console.log("✅ Selected plants:", formData.plants);
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "400px" } }}
    >
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", pb: "50px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            {initialData ? t("edit_user") : t("add_user")}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          name="username"
          label={t("login_email")}
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username && errors.username[0]}
        />

        <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 1 }}>
          <InputLabel>{t("password")}</InputLabel>
          <OutlinedInput
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label={t("password")}
          />
          {errors.password && (
            <Typography color="error" variant="caption" sx={{ ml: 2 }}>
              {errors.password[0]}
            </Typography>
          )}
        </FormControl>

        <TextField
          name="full_name"
          label={t("full_name")}
          fullWidth
          margin="normal"
          value={formData.full_name}
          onChange={handleChange}
          error={!!errors.full_name}
          helperText={errors.full_name && errors.full_name[0]}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>{t("gender")}</InputLabel>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            label={t("gender")}
          >
            <MenuItem value="Male">{t("male")}</MenuItem>
            <MenuItem value="Female">{t("female")}</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={t("birth_date")}
            value={dayjs(formData.date_of_birth)}
            onChange={handleDateChange}
            sx={{ mt: 2, mb: 1 }}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>

        <TextField
          name="email"
          label="Email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email && errors.email[0]}
        />

        <TextField
          name="phone_number"
          label={t("phone_number")}
          fullWidth
          margin="normal"
          value={formData.phone_number}
          onChange={handleChange}
          error={!!errors.phone_number}
          helperText={errors.phone_number && errors.phone_number[0]}
        />

        <TextField
          name="address"
          label={t("admin_page_factory_address")}
          fullWidth
          margin="normal"
          value={formData.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address && errors.address[0]}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>{t("role")}</InputLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            label="Vai trò"
          >
            <MenuItem value="admin">{t("admin")}</MenuItem>
            <MenuItem value="manager">{t("user")}</MenuItem>
            <MenuItem value="user">{t("manager")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>{t("plant_access")}</InputLabel>
          <Select
            multiple
            value={formData.plants || []}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, plants: e.target.value }))
            }
            renderValue={(selected) =>
              selected
                .map((id) => plants.find((p) => p.id === id)?.name || id)
                .join(", ")
            }
          >
            {plants.map((plant) => (
              <MenuItem key={plant.id} value={plant.id}>
                <Checkbox checked={formData.plants.includes(plant.id)} />
                <ListItemText primary={plant.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ background: "#074E9F", color: "#ffffff", mt: 3 }}
        >
          {initialData ? t("update") : t("create")}
        </Button>
      </Box>
    </Drawer>
  );
}
