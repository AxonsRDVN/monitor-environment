import { useTranslation } from "react-i18next";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageContainer from "../PageContainer/PageContainer";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { useEffect, useState } from "react";
import axios from "axios";
import { useError } from "../../context/ErrorContext";
import DeviceStatusTabel from "../Table/DeviceStatusTable";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { getAllPlants } from "../../api/plantApi";

const API_BASE = process.env.REACT_APP_API_URL;

export default function DeviceStatus() {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [sensors, setSensors] = useState([]);
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
    if (selectedPlant) {
      async function fetchMaintenance() {
        try {
          setLoading(true);
          const res = await axios.get(
            `${API_BASE}/monitor-environment/plant/${selectedPlant}/maintenance-reminders/`
          );
          setSensors(res.data || []);
        } catch (error) {
          console.error("Lỗi khi load maintenance:", error);
          showError(showError(t("can_connect_to_server")));
        } finally {
          setLoading(false);
        }
      }
      fetchMaintenance();
    }
  }, [selectedPlant]);

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("report"), path: "/report/device-status" },
          { label: t("device_status"), path: "/report/device-status" },
        ]}
      />
      <PageTitle title={t("device_status")} />
      <PageContent>
        <Box mb={6}>
          <FormControl sx={{ minWidth: 250 }}>
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
        </Box>
        <DeviceStatusTabel sensors={sensors} />
      </PageContent>
    </PageContainer>
  );
}
