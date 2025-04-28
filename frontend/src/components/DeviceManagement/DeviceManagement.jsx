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
import { useError } from "../../context/ErrorContext"; // ✅ import thiếu

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

  // Lấy danh sách plant
  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await axios.get(`${API_BASE}/monitor-environment/plants/`);
        const plantList = res.data || [];
        setPlants(plantList);

        if (plantList.length > 0) {
          setSelectedPlant(plantList[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà máy:", error.message);
        showError("Không thể tải danh sách nhà máy. Vui lòng thử lại sau!");
      }
    }
    fetchPlants();
  }, []);

  // Lấy danh sách station theo plant
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

        // Gộp cả master và station con
        stationList.forEach((master) => {
          allStations.push({
            id: master.id,
            name: master.name,
            type: master.type,
            code: master.code,
          });

          if (master.stations && master.stations.length > 0) {
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
          setSelectedStation(allStations[0].id); // Chọn mặc định
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách trạm:", error.message);
        showError("Không thể tải danh sách trạm. Vui lòng thử lại sau!");
        setStations([]);
      }
    }
    fetchStations();
  }, [selectedPlant]);

  // Lấy danh sách sensor theo station
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
        console.error("Lỗi khi tải danh sách sensor:", error.message);
        showError("Không thể tải danh sách thiết bị. Vui lòng thử lại sau!");
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
          { label: "Quản lí thiết bị", path: "/setting/warning_threshold" },
        ]}
      />
      <PageTitle title={"Quản lí thiết bị"} />
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
            sx={{ width: { xs: "100%", sm: "50%" } }}
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
          ) : stations.length === 0 ? (
            <Typography variant="body2">Không có trạm nào.</Typography>
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
