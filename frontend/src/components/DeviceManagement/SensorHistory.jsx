import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { useTranslation } from "react-i18next";
import HistoryMaintenanceTable from "../Table/HistoryMaintenanceTable";
import MapDialog from "../Dialog/MapDialog";
import { useError } from "../../context/ErrorContext";

const API_BASE = process.env.REACT_APP_API_URL;

export default function SensorHistory() {
  const { sensorId } = useParams();
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();
  const { t } = useTranslation("translation");
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const sensorRes = await axios.get(
          `${API_BASE}/monitor-environment/history/${sensorId}/detail/`
        );
        setSensor(sensorRes.data);
      } catch (error) {
        console.error("Error fetching sensor:", error);
        showError(showError(t("can_connect_to_server")));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sensorId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!sensor) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6">{t("no_sensor")}</Typography>
      </Box>
    );
  }

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("device_management"), path: "/device-management" },
          { label: t("maintenance_history"), path: "/device-management" },
        ]}
      />
      <PageTitle title={t("maintenance_history")} />
      <PageContent>
        {sensor.length > 0 ? (
          <HistoryMaintenanceTable
            sensor={sensor}
            onViewLocation={(lat, lng) => {
              setSelectedLocation({ lat, lng });
              setMapDialogOpen(true);
            }}
          />
        ) : (
          <Typography textAlign="center" mt={4}>
            Không có lịch sử bảo trì cho thiết bị này.
          </Typography>
        )}
        <MapDialog
          open={mapDialogOpen}
          onClose={() => setMapDialogOpen(false)}
          latitude={selectedLocation.lat}
          longitude={selectedLocation.lng}
        />
      </PageContent>
    </PageContainer>
  );
}
