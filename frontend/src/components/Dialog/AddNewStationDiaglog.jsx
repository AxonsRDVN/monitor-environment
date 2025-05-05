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

const API_BASE = process.env.REACT_APP_API_URL;

const stationTypeOptions = [
  { value: 1, label: "Station" },
  { value: 2, label: "Master" },
];

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
    sensorId: "", // 👈 thêm để lưu sensor đã chọn
    selectedSensors: [], // 👈 danh sách sensor được tick chọn
    selectedParameters: [],
  });
  const [plants, setPlants] = useState([]);
  const [masters, setMasters] = useState([]);
  const [sensors, setSensors] = useState([]);
  const { showError } = useError();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await getAllPlants();
        setPlants(res);
        if (res.length > 0) {
          setStationData((prev) => ({ ...prev, plant: res[0].id }));
        }
      } catch (err) {
        showError("Không thể kết nối server!");
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
        console.log("API trả về:", response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sensor", error);
      }
    };

    fetchSensors(); // GỌI LUÔN
  }, []);
  console.log(sensors);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setStationData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" && value === 2 ? { master: "" } : {}), // Nếu chọn Master thì reset master
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
      showError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const payload = { ...stationData };
      if (payload.type === 2) {
        delete payload.master;
      }

      // Step 1: Tạo station
      const response = await createStation(payload);
      const stationId = response.data.id;
      const plantId = stationData.plant;

      // Step 2: Clone sensors
      for (const sensorId of stationData.selectedSensors) {
        await cloneSensor(sensorId, stationId, plantId);
      }

      // ✅ Gọi lại hàm reload cha (nếu có)
      if (onSubmit) {
        onSubmit();
      }

      // ✅ Hiển thị thông báo
      setSuccessMessage("Thêm trạm thành công!");

      // Reset form
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
      showError("Không thể tạo trạm hoặc clone sensor. Vui lòng kiểm tra lại!");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: "400px" },
      }}
    >
      <Box
        sx={{
          p: 2,
          height: "auto",
          display: "flex",
          flexDirection: "column",
          pb: "50px",
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
          <Typography variant="h6">Thêm mới trạm</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Form */}
        <Box sx={{ mt: 4, flexGrow: 1 }}>
          <TextField
            label="Chọn Plant"
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
            label="Loại trạm"
            fullWidth
            select
            margin="normal"
            value={stationData.type}
            onChange={handleChange("type")}
          >
            {stationTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {stationData.type === 1 && (
            <TextField
              label="Chọn Master"
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
                  Không có Master
                </MenuItem>
              )}
            </TextField>
          )}

          <TextField
            label="Tên trạm"
            fullWidth
            margin="normal"
            value={stationData.name}
            onChange={handleChange("name")}
          />
          <TextField
            label="Mã trạm"
            fullWidth
            margin="normal"
            value={stationData.code}
            onChange={handleChange("code")}
          />
          <TextField
            label="Vị trí"
            fullWidth
            margin="normal"
            value={stationData.location}
            onChange={handleChange("location")}
          />
          <TextField
            label="Địa chỉ"
            fullWidth
            margin="normal"
            value={stationData.address}
            onChange={handleChange("address")}
          />
          <TextField
            label="Kinh độ"
            fullWidth
            margin="normal"
            value={stationData.longitude}
            onChange={handleChange("longitude")}
          />
          <TextField
            label="Vĩ độ"
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
            label="Channel"
            fullWidth
            margin="normal"
            value={stationData.channel}
            onChange={handleChange("channel")}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1">Chọn Sensor</Typography>
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
                  Parameters của Sensor: {sensor.model_sensor}
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
                      {param.name} ({param.unit})
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
          Lưu
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
