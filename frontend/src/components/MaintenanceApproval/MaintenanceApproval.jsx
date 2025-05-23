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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import MaintenanceApprovalTabel from "../Table/MaintenanceApprovalTabel";
import MapDialog from "../Dialog/MapDialog";
import { useError } from "../../context/ErrorContext";
import ActionButtons from "../Button/ActionButtons";
import { getAllPlants } from "../../api/plantApi";

const API_BASE = process.env.REACT_APP_API_URL;

export default function MaintenanceApproval() {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [sensors, setSensors] = useState([]);
  const { showError } = useError();
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { t } = useTranslation("translation");
  const [isMaintenanceDetailPage, setIsMaintenanceDetailPage] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
  });

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
            `${API_BASE}/monitor-environment/maintenance/by-plant/${selectedPlant}/?status=pending`
          );
          setSensors(res.data || []);
        } catch (error) {
          console.error(t("toast_login_fail"), error);
          showError(showError(t("can_connect_to_server")));
        } finally {
          setLoading(false);
        }
      }
      fetchMaintenance();
    }
  }, [selectedPlant]);

  const handleViewDetail = async (maintenanceId) => {
    try {
      setLoadingDetail(true);
      const res = await axios.get(
        `${API_BASE}/monitor-environment/maintenance/${maintenanceId}/detail/`
      );
      setSelectedDetail(res.data);
      setIsMaintenanceDetailPage(true);
    } catch (error) {
      console.error(t("toast_login_fail"), error);
      showError(showError(t("can_connect_to_server")));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedDetail) return;

    try {
      await axios.patch(
        `${API_BASE}/monitor-environment/maintenance/${selectedDetail.id}/`,
        { status: newStatus }
      );
      alert(
        `${t("update_status")}: ${
          newStatus === "approved" ? t("approved") : t("rejected")
        }`
      );

      handleBackToList();
    } catch (error) {
      console.error(t("toast_login_fail"), error);
      showError(t("toast_login_fail"));
    }
  };

  const handleBackToList = () => {
    setIsMaintenanceDetailPage(false);
    setSelectedDetail(null);
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          {
            label: t("approve_maintenance"),
            path: "/approve-maintenance",
          },
        ]}
      />
      <PageTitle title={t("approve_maintenance")} />
      <PageContent>
        {!isMaintenanceDetailPage ? (
          // Trang danh sách Maintenance
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "24px", mt: 2 }}>
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

            <Box sx={{ mt: 4 }}>
              {loading ? (
                <CircularProgress />
              ) : sensors.length === 0 ? (
                <Typography>
                  Không có bảo trì nào cần duyệt cho nhà máy này.
                </Typography>
              ) : (
                <MaintenanceApprovalTabel
                  sensors={sensors}
                  onViewLocation={(lat, lng) => {
                    setSelectedLocation({ lat, lng });
                    setMapDialogOpen(true);
                  }}
                  onViewDetail={(id) => handleViewDetail(id)} // ✅ id luôn, không phải sensor
                />
              )}
              <MapDialog
                open={mapDialogOpen}
                onClose={() => setMapDialogOpen(false)}
                latitude={selectedLocation.lat}
                longitude={selectedLocation.lng}
              />
            </Box>
          </>
        ) : (
          // Trang chi tiết Maintenance
          <Box sx={{ mt: 2 }}>
            {loadingDetail ? (
              <CircularProgress />
            ) : selectedDetail ? (
              <>
                <Typography sx={{ wordBreak: "break-word" }}>
                  <strong>{t("device_model")}:</strong>{" "}
                  {selectedDetail.sensor_model}
                </Typography>
                <Typography>
                  <strong>{t("station")}:</strong> {selectedDetail.station_name}
                </Typography>
                <Typography>
                  <strong>{t("station_location")}:</strong>{" "}
                  {selectedDetail.station_location}
                </Typography>
                <Typography>
                  <strong>{t("action")}:</strong> {t(selectedDetail.action)}
                </Typography>
                <Typography>
                  <strong>{t("status")}:</strong> {t(selectedDetail.status)}
                </Typography>
                <Typography>
                  <strong>{t("requested_by")}:</strong>{" "}
                  {selectedDetail.user_name}
                </Typography>
                <Typography>
                  <strong>{t("moderator")}:</strong> {selectedDetail.moderator}
                </Typography>
                <Typography>
                  <strong>{t("role")}:</strong> {t(selectedDetail.role)}
                </Typography>
                <Typography>
                  <strong>{t("updated_at")}:</strong>{" "}
                  {new Date(selectedDetail.update_at).toLocaleString()}
                </Typography>
                <Box
                  sx={{
                    display: {
                      xs: "block",
                      sm: "flex",
                    },
                    gap: "114px",
                    alignItems: "center",
                    borderBottom: "1px solid #E4E7EC",
                    pb: 5,
                    pt: 2,
                  }}
                >
                  <iframe
                    width="100%"
                    height="300px"
                    frameBorder="0"
                    style={{ border: 0 }}
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${selectedDetail.latitude},${selectedDetail.longitude}&hl=vi&z=15&output=embed`}
                    allowFullScreen
                  />
                  <Box
                    sx={{
                      display: "flex",
                      gap: "56px",
                      textAlign: "center",
                    }}
                  >
                    {selectedDetail.image_before && (
                      <Box mt={2}>
                        <img
                          src={
                            selectedDetail.image_before.startsWith("http")
                              ? selectedDetail.image_before
                              : `${API_BASE}${selectedDetail.image_before}`
                          }
                          //   src={selectedDetail.image_before}
                          alt="Ảnh trước"
                          style={{
                            width: "100%",
                            maxHeight: "300px",
                            objectFit: "cover",
                          }}
                        />
                        <Typography pt={2}>{t("before_image")}</Typography>
                      </Box>
                    )}
                    {selectedDetail.image_after && (
                      <Box mt={2}>
                        <img
                          src={
                            selectedDetail.image_after.startsWith("http")
                              ? selectedDetail.image_after
                              : `${API_BASE}${selectedDetail.image_after}`
                          }
                          alt="Ảnh sau"
                          style={{
                            width: "100%",
                            maxHeight: "300px",
                            objectFit: "cover",
                          }}
                        />
                        <Typography pt={2}>{t("after_image")}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                <ActionButtons
                  saveText={t("save")}
                  cancelText={t("cancel")}
                  onSave={() => handleUpdateStatus("approved")}
                  onCancel={() => handleUpdateStatus("rejected")}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  onClick={handleBackToList}
                >
                  {t("go_back")}
                </Button>
              </>
            ) : (
              <Typography>{t("no_detail_maintance")}</Typography>
            )}
          </Box>
        )}
      </PageContent>
    </PageContainer>
  );
}
