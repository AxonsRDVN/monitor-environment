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
        const res = await axios.get(`${API_BASE}/monitor-environment/plants/`);
        setPlants(res.data || []);
        if (res.data.length > 0) {
          setSelectedPlant(res.data[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi load plants:", error);
        showError("Không thể kết nối server!");
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
          console.error("Lỗi khi load maintenance:", error);
          showError("Không thể kết nối server!");
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
      console.error("Lỗi khi lấy chi tiết maintenance:", error);
      showError("Không thể kết nối server!");
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
        `Đã cập nhật trạng thái: ${
          newStatus === "approved" ? "Đã duyệt" : "Hủy bỏ"
        }`
      );
      handleBackToList();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái maintenance:", error);
      showError("Không thể cập nhật trạng thái. Vui lòng thử lại!");
    }
  };

  const handleBackToList = () => {
    setIsMaintenanceDetailPage(false);
    setSelectedDetail(null);
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Duyệt bảo trì", path: "/setting/warning_threshold" }]}
      />
      <PageTitle title="Duyệt bảo trì" />
      <PageContent sx={{ marginBottom: { xs: "100px", sm: "0" } }}>
        {!isMaintenanceDetailPage ? (
          // Trang danh sách Maintenance
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "24px", mt: 2 }}>
              <FormControl sx={{ minWidth: 250 }}>
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
                <Typography>
                  <strong>Model thiết bị:</strong> {selectedDetail.sensor_model}
                </Typography>
                <Typography>
                  <strong>Trạm:</strong> {selectedDetail.station_name}
                </Typography>
                <Typography>
                  <strong>Vị trí trạm:</strong>{" "}
                  {selectedDetail.station_location}
                </Typography>
                <Typography>
                  <strong>Hành động:</strong> {selectedDetail.action}
                </Typography>
                <Typography>
                  <strong>Trạng thái:</strong> {selectedDetail.status}
                </Typography>
                <Typography>
                  <strong>Người yêu cầu:</strong> {selectedDetail.user_name}
                </Typography>
                <Typography>
                  <strong>Moderator:</strong> {selectedDetail.moderator}
                </Typography>
                <Typography>
                  <strong>Vai trò:</strong> {selectedDetail.role}
                </Typography>
                <Typography>
                  <strong>Ngày cập nhật:</strong>{" "}
                  {new Date(selectedDetail.update_at).toLocaleString()}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: "114px",
                    alignItems: "center",
                    borderBottom: "1px solid #E4E7EC",
                    pb: 5,
                  }}
                >
                  <iframe
                    width="50%"
                    height="300"
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
                        <Typography pt={2}>Ảnh trước</Typography>
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
                        <Typography pt={2}>Ảnh sau</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                <ActionButtons
                  onSave={() => handleUpdateStatus("approved")}
                  onCancel={() => handleUpdateStatus("rejected")}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3 }}
                  onClick={handleBackToList}
                >
                  Quay lại danh sách
                </Button>
              </>
            ) : (
              <Typography>Không tìm thấy chi tiết bảo trì.</Typography>
            )}
          </Box>
        )}
      </PageContent>
    </PageContainer>
  );
}
