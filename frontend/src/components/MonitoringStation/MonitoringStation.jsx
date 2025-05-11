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
  Snackbar,
  Alert,
} from "@mui/material";
import MonitoringStationTable from "../Table/MonitoringStationTable";
import MapDialog from "../Dialog/MapDialog";
import { useError } from "../../context/ErrorContext";
import AddButton from "../Button/AddButtons";
import AddNewStationDialog from "../Dialog/AddNewStationDiaglog";
import EditStationDialog from "../Dialog/EditStationDialog";
import { getAllPlants } from "../../api/plantApi";

const API_BASE = process.env.REACT_APP_API_URL;

export default function MonitoringStation() {
  const [plants, setPlants] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError } = useError();
  const { t } = useTranslation("translation");
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [addNewDialogOpen, setAddNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [reloadFlag, setReloadFlag] = useState(false);

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
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/monitor-environment/plant/${selectedPlant}/stations`
        );
        const stationList = res.data.stations || [];
        setStations(stationList);
      } catch (error) {
        console.error(t("toast_login_fail"), error.message);
        showError(t("toast_login_fail"));
        setStations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStations();
  }, [selectedPlant, reloadFlag]);

  const handleDeleteStation = async (station) => {
    if (!window.confirm(t("delete_confirm", { name: station.name }))) return;

    try {
      await axios.delete(
        `${API_BASE}/monitor-environment/station/${station.id}/`
      );
      setStations((prevStations) =>
        prevStations
          .map((master) => {
            if (master.id === station.id) return null;
            if (master.stations) {
              master.stations = master.stations.filter(
                (s) => s.id !== station.id
              );
            }
            return master;
          })
          .filter((m) => m !== null)
      );
      setSuccessMessage(t("delete_success"));
    } catch (error) {
      console.error(t("toast_login_fail"), error.message);
      showError(t("toast_login_fail"));
    }
  };

  const handleEdit = (station) => {
    setEditingStation({ ...station });
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setEditingStation(null);
  };

  const handleChange = (updated) => {
    setEditingStation(updated);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${API_BASE}/monitor-environment/station/${editingStation.id}/`,
        { ...editingStation, plant: selectedPlant }
      );
      setSuccessMessage(t("update_success"));
      setStations((prev) =>
        prev.map((master) => {
          if (master.id === editingStation.id) return editingStation;
          if (master.stations) {
            master.stations = master.stations.map((s) =>
              s.id === editingStation.id ? editingStation : s
            );
          }
          return master;
        })
      );
      setEditDialogOpen(false);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật:", error);
      showError(t("update_fail"));
    }
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          {
            label: t("monitoring_station"),
            path: "/setting/warning_threshold",
          },
        ]}
      />
      <PageTitle title={t("monitoring_station")} />
      <PageContent sx={{ marginBottom: { xs: "100px", sm: "0" } }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            mt: 2,
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <FormControl sx={{ maxWidth: 250, flex: 1 }}>
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

          <AddButton
            onClick={() => setAddNewDialogOpen(true)}
            addText={t("add_new_station")}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          {loading ? (
            <CircularProgress />
          ) : stations.length === 0 ? (
            <Typography variant="body2">{t("no_station")}</Typography>
          ) : (
            <>
              <MonitoringStationTable
                stations={stations}
                onEdit={handleEdit}
                onDelete={handleDeleteStation}
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
              <AddNewStationDialog
                open={addNewDialogOpen}
                onClose={() => setAddNewDialogOpen(false)}
                onSubmit={() => {
                  setAddNewDialogOpen(false);
                  setReloadFlag((prev) => !prev);
                }}
              />
              <EditStationDialog
                open={editDialogOpen}
                onClose={handleDialogClose}
                station={editingStation}
                onChange={handleChange}
                onUpdate={handleSave}
              />
            </>
          )}
        </Box>
      </PageContent>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
