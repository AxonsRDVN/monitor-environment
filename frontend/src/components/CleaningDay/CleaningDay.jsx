import { useTranslation } from "react-i18next";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageContainer from "../PageContainer/PageContainer";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Sensors } from "@mui/icons-material";
import ActionButtons from "../Button/ActionButtons";
import axios from "axios";
import dayjs from "dayjs";
import { useError } from "../../context/ErrorContext";

const API_BASE = process.env.REACT_APP_API_URL;

export default function CleaningDay() {
  const [plants, setPlants] = useState([]);
  const [stations, setStations] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [sensorDays, setSensorDays] = useState({});
  const [originalSensorDays, setOriginalSensorDays] = useState({});
  const [loading, setLoading] = useState(false);
  const { showError } = useError();
  const { t } = useTranslation("translation");

  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await axios.get(`${API_BASE}/monitor-environment/plants/`);
        setPlants(res.data || []);
        if (res.data.length > 0) {
          setSelectedPlant(res.data[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi lấy nhà máy:", error.message);
        showError("Không thể tải danh sách nhà máy. Vui lòng thử lại!");
      }
    }
    fetchPlants();
  }, []);

  useEffect(() => {
    async function fetchStations() {
      if (!selectedPlant) {
        setStations([]);
        return;
      }
      try {
        const res = await axios.get(
          `${API_BASE}/monitor-environment/plant/${selectedPlant}/stations`
        );
        const raw = res.data.stations || [];
        const allStations = [];
        raw.forEach((master) => {
          allStations.push({
            ...master,
            displayName: `(Master) ${master.name}`,
          });
          (master.stations || []).forEach((child) =>
            allStations.push({ ...child, displayName: `↳ ${child.name}` })
          );
        });
        setStations(allStations);
        if (allStations.length > 0) {
          setSelectedStation(allStations[0].id);
        } else {
          setSelectedStation("");
          setSensors([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy trạm:", error.message);
        showError("Không thể tải danh sách trạm. Vui lòng thử lại!");
        setStations([]);
        setSensors([]);
        setSelectedStation("");
      }
    }
    fetchStations();
  }, [selectedPlant]);

  useEffect(() => {
    async function fetchSensors() {
      if (!selectedStation) {
        setSensors([]);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/monitor-environment/sensors/${selectedStation}`
        );
        const sensorList = res.data.sensors || [];
        setSensors(sensorList);

        const daysData = {};
        sensorList.forEach((sensor) => {
          if (sensor.day_clean) {
            const days = dayjs(sensor.day_clean).diff(dayjs(), "day");
            daysData[sensor.id] = days;
          }
        });
        setSensorDays(daysData);
        setOriginalSensorDays(daysData);
      } catch (error) {
        console.error("Lỗi khi lấy sensor:", error.message);
        showError("Không thể tải danh sách thiết bị. Vui lòng thử lại!");
        setSensors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSensors();
  }, [selectedStation]);

  const handleSave = async () => {
    const today = dayjs();
    const updates = Object.entries(sensorDays).map(([sensorId, days]) => ({
      sensor_id: sensorId,
      days,
    }));

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE}/monitor-environment/sensors/update-day-clean`,
        {
          sensors: updates,
        }
      );
      alert("Cập nhật ngày vệ sinh thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu:", error.message);
      showError("Không thể lưu số ngày vệ sinh. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSensorDays(originalSensorDays);
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: "Cài đặt", path: "/setting/warning_threshold" },
          { label: "Số ngày phải vệ sinh", path: "/setting/warning_threshold" },
        ]}
      />
      <PageTitle title={"Số ngày vệ sinh"} />
      <PageContent sx={{ marginBottom: { xs: "100px", sm: "0" } }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            mt: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <FormControl fullWidth sx={{ minWidth: 250, flex: 1 }}>
            <InputLabel>Chọn nhà máy</InputLabel>
            <Select
              value={selectedPlant}
              label="Chọn nhà máy"
              onChange={(e) => setSelectedPlant(e.target.value)}
            >
              {plants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>
                  {plant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            sx={{ minWidth: 250, flex: 1 }}
            disabled={!selectedPlant}
          >
            <InputLabel>Chọn trạm</InputLabel>
            <Select
              value={selectedStation}
              label="Chọn trạm"
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  {station.displayName || station.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mt: 4 }}>
          {loading ? (
            <CircularProgress />
          ) : sensors.length === 0 ? (
            <Typography variant="body2">Không có sensor nào.</Typography>
          ) : (
            <Box>
              <List>
                {sensors.map((sensor) => (
                  <ListItem
                    key={sensor.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Icon */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Sensors color="primary" sx={{ fontSize: 40 }} />
                    </Box>

                    {/* Tên sensor + hãng */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minWidth: 200,
                      }}
                    >
                      <Typography
                        fontWeight={600}
                        sx={{
                          wordBreak: "break-word", // 🛠️ Nếu model sensor dài sẽ tự xuống dòng
                          whiteSpace: "normal",
                        }}
                      >
                        {sensor.model_sensor}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Hãng: {sensor.manufacturer}
                      </Typography>
                    </Box>

                    {/* Ô nhập số ngày */}
                    <TextField
                      type="number"
                      value={sensorDays[sensor.id] ?? ""}
                      onChange={(e) =>
                        setSensorDays({
                          ...sensorDays,
                          [sensor.id]: parseInt(e.target.value || 0),
                        })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">ngày</InputAdornment>
                        ),
                      }}
                      sx={{ width: 220 }}
                    />
                  </ListItem>
                ))}
              </List>
              <ActionButtons onSave={handleSave} onCancel={handleCancel} />
            </Box>
          )}
        </Box>
      </PageContent>
    </PageContainer>
  );
}
