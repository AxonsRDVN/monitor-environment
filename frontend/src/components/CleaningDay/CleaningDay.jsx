import { useTranslation } from "react-i18next";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageContainer from "../PageContainer/PageContainer";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { useEffect, useState } from "react";
import axios from "axios";
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
import dayjs from "dayjs";
import { Sensors } from "@mui/icons-material";
import ActionButtons from "../Button/ActionButtons";

const API_BASE = process.env.REACT_APP_API_URL; // Đổi theo server của bạn

export default function CleaningDay() {
  const [plants, setPlants] = useState([]);
  const [stations, setStations] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("translation");
  const [sensorDays, setSensorDays] = useState({});
  const [originalSensorDays, setOriginalSensorDays] = useState({});

  // Lấy danh sách plant
  useEffect(() => {
    axios.get(`${API_BASE}/monitor-environment/plants/`).then((res) => {
      const plantList = res.data || [];
      setPlants(plantList);

      if (plantList.length > 0) {
        setSelectedPlant(plantList[0].id); // Chọn plant đầu tiên
      }
    });
  }, []);

  // Lấy danh sách station theo plant
  useEffect(() => {
    if (selectedPlant) {
      axios
        .get(`${API_BASE}/monitor-environment/plant/${selectedPlant}/stations`)
        .then((res) => {
          const rawMasters = res.data.stations || [];

          const allStations = [];
          rawMasters.forEach((master) => {
            allStations.push({
              ...master,
              displayName: `(Master) ${master.name}`,
            });

            (master.stations || []).forEach((station) => {
              allStations.push({
                ...station,
                displayName: `↳ ${station.name}`,
              });
            });
          });

          setStations(allStations);

          if (allStations.length > 0) {
            setSelectedStation(allStations[0].id); // Tự động chọn station đầu tiên
          } else {
            setSensors([]);
            setSelectedStation("");
          }
        })
        .catch(() => {
          setStations([]);
          setSensors([]);
          setSelectedStation("");
        });
    } else {
      setStations([]);
      setSensors([]);
      setSelectedStation("");
    }
  }, [selectedPlant]);

  // Lấy sensor khi chọn station
  useEffect(() => {
    if (selectedStation) {
      loadSensors();
      setLoading(true);
      axios
        .get(`${API_BASE}/monitor-environment/sensors/${selectedStation}`)
        .then((res) => {
          setSensors(res.data.sensors || []);
          const newSensorDays = {};
          (res.data.sensors || []).forEach((sensor) => {
            if (sensor.day_clean) {
              const days = dayjs(sensor.day_clean).diff(dayjs(), "day");
              newSensorDays[sensor.id] = days;
            }
          });
          setSensorDays(newSensorDays);
        })
        .catch(() => setSensors([]))
        .finally(() => setLoading(false));
    } else {
      setSensors([]);
    }
  }, [selectedStation]);

  const loadSensors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/monitor-environment/sensors/${selectedStation}`
      );
      setSensors(res.data.sensors || []);
      const newSensorDays = {};
      (res.data.sensors || []).forEach((sensor) => {
        if (sensor.day_clean) {
          const days = dayjs(sensor.day_clean).diff(dayjs(), "day");
          newSensorDays[sensor.id] = days;
        }
      });
      setSensorDays(newSensorDays);
      setOriginalSensorDays(newSensorDays); // ✅ copy vào bản gốc
    } catch {
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const today = dayjs();

    const updates = Object.entries(sensorDays).map(([sensorId, days]) => {
      const day_clean = today.add(days, "day").format("YYYY-MM-DD");
      return {
        sensor_id: sensorId,
        days,
      };
    });

    try {
      await axios.post(
        `${API_BASE}/monitor-environment/sensors/update-day-clean`,
        {
          sensors: updates,
        }
      );
      alert("Cập nhật ngày vệ sinh thành công!");
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    }
  };

  const handleCancel = () => {
    setSensorDays(originalSensorDays); // ✅ trả về giá trị gốc
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("setting"), path: "/setting/warning_threshold" },
          { label: t("warning_threshold"), path: "/setting/warning_threshold" },
        ]}
      />
      <PageTitle title={"Số ngày vệ sinh"} />
      <PageContent
        sx={{
          marginBottom: {
            xs: "100px",
            sm: "0",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            mt: 2,
            flexDirection: {
              xs: "column", // Màn nhỏ: dọc
              sm: "row", // Từ sm trở lên: ngang
            },
            width: {
              xs: "100%", // Màn nhỏ: dọc
              sm: "50%", // Từ sm trở lên: ngang
            },
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
            <>
              <Box>
                <List>
                  {sensors.map((sensor) => {
                    const expiryDate = sensor.day_clean;
                    const daysLeft = expiryDate
                      ? dayjs(expiryDate).diff(dayjs(), "day")
                      : "—";

                    return (
                      <ListItem
                        key={sensor.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          gap: 4,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Sensors color="primary" />
                          <ListItemText
                            primary={sensor.model_sensor}
                            secondary={`Hãng: ${sensor.manufacturer}`}
                          />
                        </Box>
                        <TextField
                          variant="outlined"
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
                              <InputAdornment position="end">
                                ngày
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 300 }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
                <ActionButtons onSave={handleSave} onCancel={handleCancel} />
              </Box>
            </>
          )}
        </Box>
      </PageContent>
    </PageContainer>
  );
}
