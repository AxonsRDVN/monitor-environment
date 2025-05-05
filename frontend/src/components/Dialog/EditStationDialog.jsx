import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Drawer,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function EditStationDialog({
  open,
  onClose,
  station,
  onChange,
  onUpdate,
}) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) setErrors({});
  }, [open]);

  if (!station) return null;

  const handleChange = (field) => (e) => {
    onChange({ ...station, [field]: e.target.value });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!station.name?.trim()) newErrors.name = "Tên trạm không được bỏ trống";
    if (!station.code?.trim()) newErrors.code = "Mã trạm không được bỏ trống";
    if (!station.location?.trim())
      newErrors.location = "Vị trí không được bỏ trống";
    if (!station.address?.trim())
      newErrors.address = "Địa chỉ không được bỏ trống";
    if (!station.channel?.trim())
      newErrors.channel = "Channel không được bỏ trống";
    if (!station.latitude?.trim()) newErrors.latitude = "Kinh độ bắt buộc";
    if (!station.longitude?.trim()) newErrors.longitude = "Vĩ độ bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onUpdate();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "400px" } }}
    >
      <Box
        sx={{ p: 2, display: "flex", flexDirection: "column", height: "100" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Chỉnh sửa trạm</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2, flexGrow: 1 }}>
          <TextField
            fullWidth
            label="Tên trạm"
            margin="normal"
            value={station.name || ""}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            label="Mã trạm"
            margin="normal"
            value={station.code || ""}
            onChange={handleChange("code")}
            error={!!errors.code}
            helperText={errors.code}
          />
          <TextField
            fullWidth
            label="Vị trí"
            margin="normal"
            value={station.location || ""}
            onChange={handleChange("location")}
            error={!!errors.location}
            helperText={errors.location}
          />
          <TextField
            fullWidth
            label="Channel"
            margin="normal"
            value={station.channel || ""}
            onChange={handleChange("channel")}
            error={!!errors.channel}
            helperText={errors.channel}
          />
          <TextField
            fullWidth
            label="Địa chỉ"
            margin="normal"
            value={station.address || ""}
            onChange={handleChange("address")}
            error={!!errors.address}
            helperText={errors.address}
          />
          <TextField
            fullWidth
            label="Kinh độ"
            margin="normal"
            value={station.latitude || ""}
            onChange={handleChange("latitude")}
            error={!!errors.latitude}
            helperText={errors.latitude}
          />
          <TextField
            fullWidth
            label="Vĩ độ"
            margin="normal"
            value={station.longitude || ""}
            onChange={handleChange("longitude")}
            error={!!errors.longitude}
            helperText={errors.longitude}
          />
          {station.latitude && station.longitude && (
            <iframe
              title="Google Map"
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${station.latitude},${station.longitude}&hl=vi&z=16&output=embed`}
              allowFullScreen
            />
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ marginBottom: "50px", marginTop: "20px" }}
        >
          Cập nhật
        </Button>
      </Box>
    </Drawer>
  );
}
