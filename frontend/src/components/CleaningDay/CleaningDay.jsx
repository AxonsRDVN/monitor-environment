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
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Router } from "@mui/icons-material";
import ActionButtons from "../Button/ActionButtons";
import axios from "axios";
import dayjs from "dayjs";
import { useError } from "../../context/ErrorContext";
import { getAllPlants } from "../../api/plantApi";

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
        const res = await getAllPlants();
        setPlants(res);
        if (res.length > 0) {
          setSelectedPlant(res[0].id);
        }
      } catch (error) {
        console.error(t("toast_login_fail"), error.message);
        showError(t("toast_login_fail"));
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
        console.error("error", error.message);
        showError("error");
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
            const days = dayjs(sensor.day_clean).diff(
              dayjs().startOf("day"),
              "day"
            );
            daysData[sensor.id] = days;
          }
        });
        setSensorDays(daysData);
        setOriginalSensorDays(daysData);
      } catch (error) {
        console.error("error", error.message);
        showError("error");
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
      alert(t("update_day_clean_successfully"));
    } catch (error) {
      console.error("error", error.message);
      showError("error");
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
          { label: t("setting"), path: "/setting/cleaning_day" },
          { label: t("cleaning_day"), path: "/setting/cleaning_day" },
        ]}
      />
      <PageTitle title={t("cleaning_day")} />
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
            <InputLabel>{t("plant")}</InputLabel>
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
            <InputLabel>{t("station")}</InputLabel>
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
            <Typography variant="body2">{t("no_sensor")}</Typography>
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
                      <Router color="primary" sx={{ fontSize: 40 }} />
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
                        {t("manufacturer")}: {sensor.manufacturer}
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
                          <InputAdornment position="end">
                            {t("day")}
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: 220 }}
                    />
                  </ListItem>
                ))}
              </List>
              <ActionButtons
                onSave={handleSave}
                onCancel={handleCancel}
                saveText={t("save")}
                cancelText={t("cancel")}
              />
            </Box>
          )}
        </Box>
      </PageContent>
    </PageContainer>
  );
}
