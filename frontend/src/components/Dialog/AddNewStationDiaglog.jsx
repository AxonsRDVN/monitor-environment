import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useError } from "../../context/ErrorContext";
import { getAllPlants } from "../../api/plantApi";
import axios from "axios";
import { createStation } from "../../api/stationApi";
import { cloneSensor } from "../../api/sensorApi";
import { useTranslation } from "react-i18next";

const API_BASE = process.env.REACT_APP_API_URL;

export default function AddNewStationDialog({ open, onClose, onSubmit }) {
  const [stationData, setStationData] = useState({
    name: "",
    code: "",
    location: "",
    address: "",
    latitude: "",
    longitude: "",
    channel: "",
    plant: "",
    type: 1,
    master: "",
    sensorId: "",
    selectedSensors: [],
    selectedParameters: [],
  });

  const [plants, setPlants] = useState([]);
  const [masters, setMasters] = useState([]);
  const [sensors, setSensors] = useState([]);
  const { showError } = useError();
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useTranslation("translation");

  const stationTypeOptions = [
    { value: 1, labelKey: t("Station") },
    { value: 2, labelKey: t("Master") },
  ];

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await getAllPlants();
        setPlants(res);
        if (res.length > 0) {
          setStationData((prev) => ({ ...prev, plant: res[0].id }));
        }
      } catch (err) {
        showError(t("can_connect_to_server"));
        console.error(err);
      }
    };
    if (open) {
      fetchPlants();
    }
  }, [open, showError]);

  useEffect(() => {
    const fetchMasters = async () => {
      if (!stationData.plant) return;
      try {
        const response = await axios.get(
          `${API_BASE}/monitor-environment/plant/${stationData.plant}/stations`
        );
        const allMasters = response.data.stations.filter(
          (station) => station.type === 2
        );
        setMasters(allMasters);
      } catch (error) {
        console.error("Lỗi fetch Master:", error);
      }
    };
    fetchMasters();
  }, [stationData.plant]);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await axios.get(`${API_BASE}/sensor-manager/sensors/`);
        setSensors(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sensor", error);
      }
    };

    fetchSensors();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setStationData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" && value === 2 ? { master: "" } : {}),
    }));
  };

  const handleSubmit = async () => {
    const requiredFields = [
      stationData.name,
      stationData.code,
      stationData.location,
      stationData.address,
      stationData.latitude,
      stationData.longitude,
      stationData.channel,
      stationData.plant,
      ...(stationData.type === 1 ? [stationData.master] : []),
    ];

    const hasEmptyField = requiredFields.some(
      (field) => !field || field === ""
    );

    if (hasEmptyField) {
      showError(t("fill_all_fields"));
      return;
    }

    try {
      const payload = { ...stationData };
      if (payload.type === 2) {
        delete payload.master;
      }

      const response = await createStation(payload);
      const stationId = response.data.id;
      const plantId = stationData.plant;

      for (const sensorId of stationData.selectedSensors) {
        await cloneSensor(sensorId, stationId, plantId);
      }

      if (onSubmit) onSubmit();

      setSuccessMessage(t("add_station_success"));

      setStationData({
        name: "",
        code: "",
        location: "",
        address: "",
        latitude: "",
        longitude: "",
        channel: "",
        plant: plants.length > 0 ? plants[0].id : "",
        type: 1,
        master: "",
        selectedSensors: [],
        selectedParameters: [],
      });

      onClose();
    } catch (error) {
      console.error("Lỗi tạo trạm hoặc clone sensor:", error);
      showError(t("create_or_clone_failed"));
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
          height: "auto",
          display: "flex",
          flexDirection: "column",
          pb: "100px",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">{t("add_new_station")}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Form */}
        <Box sx={{ mt: 4, flexGrow: 1 }}>
          <TextField
            label={t("plant")}
            fullWidth
            select
            margin="normal"
            value={stationData.plant}
            onChange={handleChange("plant")}
          >
            {plants.map((plant) => (
              <MenuItem key={plant.id} value={plant.id}>
                {plant.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t("station_type")}
            fullWidth
            select
            margin="normal"
            value={stationData.type}
            onChange={handleChange("type")}
          >
            {stationTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </MenuItem>
            ))}
          </TextField>

          {stationData.type === 1 && (
            <TextField
              label={t("select_master")}
              fullWidth
              select
              margin="normal"
              value={stationData.master}
              onChange={handleChange("master")}
            >
              {masters.length > 0 ? (
                masters.map((master) => (
                  <MenuItem key={master.id} value={master.id}>
                    {master.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  {t("no_master")}
                </MenuItem>
              )}
            </TextField>
          )}

          <TextField
            label={t("station_name")}
            fullWidth
            margin="normal"
            value={stationData.name}
            onChange={handleChange("name")}
          />
          <TextField
            label={t("station_code")}
            fullWidth
            margin="normal"
            value={stationData.code}
            onChange={handleChange("code")}
          />
          <TextField
            label={t("location")}
            fullWidth
            margin="normal"
            value={stationData.location}
            onChange={handleChange("location")}
          />
          <TextField
            label={t("address")}
            fullWidth
            margin="normal"
            value={stationData.address}
            onChange={handleChange("address")}
          />
          <TextField
            label={t("longitude")}
            fullWidth
            margin="normal"
            value={stationData.longitude}
            onChange={handleChange("longitude")}
          />
          <TextField
            label={t("latitude")}
            fullWidth
            margin="normal"
            value={stationData.latitude}
            onChange={handleChange("latitude")}
          />

          <iframe
            title="Google Map"
            width="100%"
            height="300"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${stationData.longitude},${stationData.latitude}&hl=vi&z=16&output=embed`}
            allowFullScreen
          />

          <TextField
            label={t("channel")}
            fullWidth
            margin="normal"
            value={stationData.channel}
            onChange={handleChange("channel")}
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1">{t("select_sensor")}</Typography>
            {sensors.map((sensor) => (
              <Box
                key={sensor.id}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={stationData.selectedSensors.includes(sensor.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setStationData((prev) => ({
                      ...prev,
                      selectedSensors: checked
                        ? [...prev.selectedSensors, sensor.id]
                        : prev.selectedSensors.filter((id) => id !== sensor.id),
                    }));
                  }}
                />
                <Typography sx={{ ml: 1 }}>{sensor.model_sensor}</Typography>
              </Box>
            ))}
          </Box>

          {stationData.selectedSensors.map((sensorId) => {
            const sensor = sensors.find((s) => s.id === sensorId);
            return (
              <Box
                key={sensorId}
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
                {sensor.parameters.map((param) => (
                  <Box
                    key={param.id}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={stationData.selectedParameters.includes(
                        param.id
                      )}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setStationData((prev) => ({
                          ...prev,
                          selectedParameters: checked
                            ? [...prev.selectedParameters, param.id]
                            : prev.selectedParameters.filter(
                                (id) => id !== param.id
                              ),
                        }));
                      }}
                    />
                    <Typography sx={{ ml: 1 }}>
                      {t(param.name)} ({param.unit})
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>

        {/* Actions */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
        >
          {t("save")}
        </Button>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSuccessMessage("")}
            severity="success"
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Drawer>
  );
}
