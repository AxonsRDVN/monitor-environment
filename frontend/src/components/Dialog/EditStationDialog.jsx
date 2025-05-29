import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Drawer,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { cloneSensor } from "../../api/sensorApi";

const API_BASE = process.env.REACT_APP_API_URL;

export default function EditStationDialog({
  open,
  onClose,
  station,
  onChange,
  onUpdate,
}) {
  const [errors, setErrors] = useState({});
  const [sensors, setSensors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useTranslation("translation");
  const [errorMessage, setErrorMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // or "error"

  useEffect(() => {
    if (open && station?.id) {
      setErrors({});
      fetchSensors(); // gọi API mới
    }
  }, [open, station?.id]);

  const fetchSensors = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/monitor-environment/station-all/${station.id}/`
      );
      const data = response.data;

      // Cập nhật toàn bộ sensors từ API trả về
      setSensors(data.sensors || []);

      // Lưu selected sensors và parameters đã chọn
      onChange({
        ...station,
        selectedSensors: data.selectedSensors || [],
        selectedParameters: data.selectedParameters || [],
        originalSelectedSensors: data.originalSelectedSensors || [],
      });
    } catch (error) {
      console.error("Error fetching station data:", error);
    }
  };

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

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onUpdate();

        const stationId = station.id;
        const plantId = 1;

        // ✅ cloneSensor: gom lỗi nếu có
        for (const sensorId of station.selectedSensors) {
          if (
            !station.originalSelectedSensors ||
            !station.originalSelectedSensors.includes(sensorId)
          ) {
            try {
              const response = await cloneSensor(sensorId, stationId, plantId);
              if (response?.data?.error) {
                throw new Error(response.data.error);
              }
            } catch (cloneError) {
              // ✅ Nếu bất kỳ sensor nào lỗi → hiện lỗi và dừng
              setAlertType("error");
              setAlertMessage(
                cloneError?.response?.data?.error || "Lỗi khi nhân bản sensor."
              );
              return; // ⛔ Dừng luôn, không set thành công
            }
          }
        }

        // ✅ Nếu tất cả đều ok → báo thành công
        setAlertType("success");
        setAlertMessage(t("update_station_success"));
      } catch (error) {
        console.error("Error updating station or sensors:", error);
        setAlertType("error");
        setAlertMessage(
          error?.response?.data?.error || t("update_station_failed")
        );
      }
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
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "auto",
          pb: "50px",
        }}
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

          {/* Add Sensor Selection - Updated to match AddNewStationDialog */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1">{t("select_sensor")}</Typography>
            {sensors.map((sensor) => (
              <Box
                key={sensor.id}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={station.selectedSensors?.includes(sensor.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange({
                      ...station,
                      selectedSensors: checked
                        ? [...(station.selectedSensors || []), sensor.id]
                        : (station.selectedSensors || []).filter(
                            (id) => id !== sensor.id
                          ),
                    });
                  }}
                />
                <Typography sx={{ ml: 1 }}>{sensor.model_sensor}</Typography>
              </Box>
            ))}
          </Box>

          {/* HIỂN THỊ TẤT CẢ PARAMETERS CỦA SENSOR */}
          {sensors.map((sensor) => (
            <Box
              key={sensor.id}
              sx={{
                mt: 2,
                mb: 2,
                p: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {t("parameter_of_sensor")}: {sensor.model_sensor}
              </Typography>
              {sensor.parameters &&
                sensor.parameters.map((param) => (
                  <Box
                    key={param.id}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={station.selectedParameters?.includes(param.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onChange({
                          ...station,
                          selectedParameters: checked
                            ? [...(station.selectedParameters || []), param.id]
                            : (station.selectedParameters || []).filter(
                                (id) => id !== param.id
                              ),
                        });
                      }}
                    />
                    <Typography sx={{ ml: 1 }}>
                      {t(param.name)} ({param.unit})
                    </Typography>
                  </Box>
                ))}
            </Box>
          ))}
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

        <Snackbar
          open={!!alertMessage}
          autoHideDuration={3000}
          onClose={() => setAlertMessage("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setAlertMessage("")}
            severity={alertType}
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Drawer>
  );
}
