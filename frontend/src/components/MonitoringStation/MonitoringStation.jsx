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
import MonitoringStationTable from "../Table/MonitoringStationTable";
import AddNewButton from "../Button/ActionButtons";
import MapDialog from "../Dialog/MapDialog";
import { useError } from "../../context/ErrorContext"; // ✅ Đúng rồi nè

const API_BASE = process.env.REACT_APP_API_URL; // Đổi theo server của bạn

export default function MonitoringStation() {
  const [plants, setPlants] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError } = useError(); // ✅ Sửa lại đúng useError() (lúc trước bạn ghi nhầm useErrorr())
  const { t } = useTranslation("translation");
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
  });

  // Lấy danh sách plant
  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await axios.get(`${API_BASE}/monitor-environment/plants/`);
        const plantList = res.data || [];
        setPlants(plantList);

        if (plantList.length > 0) {
          setSelectedPlant(plantList[0].id); // Chọn plant đầu tiên
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhà máy:", error.message);
        showError("Không thể tải danh sách nhà máy. Vui lòng thử lại sau.");
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
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/monitor-environment/plant/${selectedPlant}/stations`
        );
        const stationList = res.data.stations || [];
        setStations(stationList);
      } catch (error) {
        console.error("Lỗi khi tải danh sách trạm:", error.message);
        showError("Không thể tải danh sách trạm. Vui lòng thử lại sau.");
        setStations([]); // Reset trạm khi lỗi
      } finally {
        setLoading(false);
      }
    }

    fetchStations();
  }, [selectedPlant]);

  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Trạm giám sát", path: "/setting/warning_threshold" }]}
      />
      <PageTitle title={"Trạm giám sát"} />
      <PageContent sx={{ marginBottom: { xs: "100px", sm: "0" } }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            mt: 2,
            justifyContent: "space-between",
            flexDirection: {
              xs: "column", // Màn nhỏ: dọc
              sm: "row", // Từ sm trở lên: ngang
            },
          }}
        >
          <FormControl sx={{ maxWidth: 250, flex: 1 }}>
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
          <AddNewButton />
        </Box>

        <Box sx={{ mt: 4 }}>
          {loading ? (
            <CircularProgress />
          ) : stations.length === 0 ? (
            <Typography variant="body2">Không có trạm nào.</Typography>
          ) : (
            <>
              <MonitoringStationTable
                stations={stations}
                onEdit={(station) => console.log("Edit", station)}
                onDelete={(station) => console.log("Delete", station)}
                onViewLocation={(lat, lng) => {
                  setSelectedLocation({ lat, lng });
                  setMapDialogOpen(true);
                }}
              />
              <MapDialog
                open={mapDialogOpen}
                onClose={() => setMapDialogOpen(false)}
                latitude={selectedLocation.lat}
                longitude={selectedLocation.lng}
              />
            </>
          )}
        </Box>
      </PageContent>
    </PageContainer>
  );
}
