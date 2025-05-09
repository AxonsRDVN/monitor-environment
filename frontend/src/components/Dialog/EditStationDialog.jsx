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
import { useTranslation } from "react-i18next";

export default function EditStationDialog({
  open,
  onClose,
  station,
  onChange,
  onUpdate,
}) {
  const [errors, setErrors] = useState({});
  const { t } = useTranslation("translation");

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
    if (!station.name?.trim()) newErrors.name = t("station_name_required");
    if (!station.code?.trim()) newErrors.code = t("station_code_required");
    if (!station.location?.trim()) newErrors.location = t("location_required");
    if (!station.address?.trim()) newErrors.address = t("address_required");
    if (!station.channel?.trim()) newErrors.channel = t("channel_required");
    if (!station.latitude?.trim()) newErrors.latitude = t("latitude_required");
    if (!station.longitude?.trim())
      newErrors.longitude = t("longitude_required");
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
          <Typography variant="h6">{t("edit_station")}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2, flexGrow: 1 }}>
          <TextField
            fullWidth
            label={t("station_name")}
            margin="normal"
            value={station.name || ""}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            label={t("station_code")}
            margin="normal"
            value={station.code || ""}
            onChange={handleChange("code")}
            error={!!errors.code}
            helperText={errors.code}
          />
          <TextField
            fullWidth
            label={t("location")}
            margin="normal"
            value={station.location || ""}
            onChange={handleChange("location")}
            error={!!errors.location}
            helperText={errors.location}
          />
          <TextField
            fullWidth
            label={t("channel")}
            margin="normal"
            value={station.channel || ""}
            onChange={handleChange("channel")}
            error={!!errors.channel}
            helperText={errors.channel}
          />
          <TextField
            fullWidth
            label={t("address")}
            margin="normal"
            value={station.address || ""}
            onChange={handleChange("address")}
            error={!!errors.address}
            helperText={errors.address}
          />
          <TextField
            fullWidth
            label={t("longitude")}
            margin="normal"
            value={station.latitude || ""}
            onChange={handleChange("latitude")}
            error={!!errors.latitude}
            helperText={errors.latitude}
          />
          <TextField
            fullWidth
            label={t("latitude")}
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
          {t("update")}
        </Button>
      </Box>
    </Drawer>
  );
}
