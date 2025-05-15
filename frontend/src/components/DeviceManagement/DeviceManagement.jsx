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
  CircularProgress,
} from "@mui/material";
import DeviceManagementTable from "../Table/DeviceManagementTable";
import { useNavigate } from "react-router-dom";
import { useError } from "../../context/ErrorContext";
import { getAllPlants } from "../../api/plantApi";

const API_BASE = process.env.REACT_APP_API_URL;

export default function DeviceManagement() {
  const [plants, setPlants] = useState([]);
  const [stations, setStations] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError } = useError();
  const { t } = useTranslation("translation");
  const navigate = useNavigate();

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
        const stationList = res.data.stations || [];
        const allStations = [];

        stationList.forEach((master) => {
          allStations.push({
            id: master.id,
            name: master.name,
            type: master.type,
            code: master.code,
          });

          if (master.stations?.length > 0) {
            master.stations.forEach((station) => {
              allStations.push({
                id: station.id,
                name: station.name,
                type: station.type,
                code: station.code,
              });
            });
          }
        });

        setStations(allStations);
        if (allStations.length > 0) {
          setSelectedStation(allStations[0].id);
        }
      } catch (error) {
        console.error(t("load_station_error"), error.message);
        showError(t("load_station_error"));
        setStations([]);
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
        setSensors(res.data.sensors || []);
      } catch (error) {
        console.error(t("load_sensor_error"), error.message);
        showError(t("load_sensor_error"));
        setSensors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSensors();
  }, [selectedStation]);
  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("device_management"), path: "/setting/device-management" },
        ]}
      />
      <PageTitle title={t("device_management")} />
      <PageContent sx={{ marginBottom: { xs: "100px", sm: "0" } }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 2,
          }}
        >
          <FormControl sx={{ width: { xs: "100%", sm: "50%" } }}>
            <InputLabel>{t("plant")}</InputLabel>
            <Select
              value={selectedPlant}
              label={t("plant")}
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
            sx={{ width: { xs: "100%", sm: "50%" } }}
            disabled={!selectedPlant}
          >
            <InputLabel>{t("station")}</InputLabel>
            <Select
              value={selectedStation}
              label={t("station")}
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
          ) : stations.length === 0 ? (
            <Typography variant="body2">{t("no_station")}</Typography>
          ) : sensors.length === 0 ? (
            <Typography variant="body2">{t("no_sensor")}</Typography>
          ) : (
            <DeviceManagementTable
              sensors={sensors}
              onMaintenance={(sensor) => {
                navigate(
                  `/device-management/maintenance/${selectedStation}/${sensor.id}`
                );
              }}
              onHistory={(sensor) => {
                navigate(`/device-management/history/${sensor.id}`);
              }}
            />
          )}
        </Box>
      </PageContent>
    </PageContainer>
  );
}
