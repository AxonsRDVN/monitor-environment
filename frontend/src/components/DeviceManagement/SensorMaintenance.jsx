import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../BreadCrumb/Breadcrumb";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { useTranslation } from "react-i18next";
import { useError } from "../../context/ErrorContext";
import ActionButtons from "../Button/ActionButtons";
import { AddPhotoAlternate } from "@mui/icons-material";

const API_BASE = process.env.REACT_APP_API_URL;

export default function SensorMaintenance() {
  const { stationId, sensorId } = useParams();
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [imageBefore, setImageBefore] = useState(null);
  const [imageAfter, setImageAfter] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const { t } = useTranslation("translation");
  const [action, setAction] = useState("maintenance");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const sensorRes = await axios.get(
          `${API_BASE}/monitor-environment/sensors/${stationId}/sensor/${sensorId}`
        );
        setSensor(sensorRes.data);

        // Lấy vị trí người dùng
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          });
        }
      } catch (error) {
        console.error("Error fetching sensor:", error);
        showError("Không thể kết nối server!");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sensorId, stationId]);

  const handleSubmit = async () => {
    if (!imageBefore || !imageAfter) {
      alert("Vui lòng chọn ảnh trước và sau bảo trì!");
      return;
    }

    const fixedLatitude = latitude ? latitude.toFixed(6) : null;
    const fixedLongitude = longitude ? longitude.toFixed(6) : null;

    const formData = new FormData();
    formData.append("sensor", sensorId);
    formData.append("action", action); // Mặc định là bảo trì, nếu có thêm thay thế sau này thì sửa
    formData.append("image_before", imageBefore);
    formData.append("image_after", imageAfter);
    formData.append("user_name", "Tên người dùng A"); // Nếu có user đăng nhập thì thay bằng tên user thực tế
    formData.append("moderator", "Người quản lý B"); // Nếu cần chọn thì thêm input, hiện hardcode
    formData.append("role", "admin"); // Lắp đặt, hoặc lấy từ login
    formData.append("latitude", fixedLatitude);
    formData.append("longitude", fixedLongitude);

    try {
      setLoadingSubmit(true);
      await axios.post(
        `${API_BASE}/monitor-environment/maintenance/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Gửi yêu cầu bảo trì thành công!");
      navigate(`/device-management/history/${sensorId}`);
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      alert("Gửi thất bại, vui lòng thử lại!");
    } finally {
      setLoadingSubmit(false);
    }
  };

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
        <Typography variant="h6">Không tìm thấy sensor.</Typography>
      </Box>
    );
  }

  const handleBack = () => {
    navigate(-1); // Quay về trang trước
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("setting"), path: "/setting/warning_threshold" },
          { label: t("warning_threshold"), path: "/setting/warning_threshold" },
        ]}
      />
      <PageTitle title={"Bảo trì"} />
      <PageContent>
        <Box mb={2} color={"#344054"} fontWeight={"700"} fontSize={"22px"}>
          {sensor.model_sensor}
        </Box>
        <Box mb={2}>
          Nhà máy/Trang trại: <strong>{sensor.plant_name}</strong>
        </Box>
        <Box mb={2}>
          Trạm: <strong>{sensor.station_name}</strong>
        </Box>
        <Box mt={2}>
          <FormControl sx={{ mt: 2, width: "334px" }}>
            <InputLabel id="action-select-label">Hành động</InputLabel>
            <Select
              labelId="action-select-label"
              value={action}
              label="Hành động"
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="maintenance">Bảo trì</MenuItem>
              <MenuItem value="replacement">Thay thế</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box mt={4}>
          <Box
            pt={4}
            pb={6}
            borderTop={"1px solid #E4E7EC"}
            borderBottom={"1px solid #E4E7EC"}
            textAlign={"center"}
          >
            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {/* Ảnh trước bảo trì */}
              <Box sx={{ position: "relative", width: 240, height: 240 }}>
                {/* Nếu có ảnh thì hiện ảnh, ngược lại hiện Box upload */}
                {imageBefore ? (
                  <img
                    src={URL.createObjectURL(imageBefore)}
                    alt="Ảnh trước"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      background: "#DEEDFE",
                      alignItems: "center",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      p: "20px",
                      borderRadius: "8px",
                      border: "1px dashed #0086C9",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <AddPhotoAlternate
                      sx={{
                        fontSize: "54px",
                        color: "#0086C9",
                        mb: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#0086C9",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                    >
                      Click to upload
                    </Typography>
                    <Typography sx={{ color: "#344054", fontSize: "14px" }}>
                      or drag and drop
                    </Typography>
                  </Box>
                )}

                {/* Ô chọn file luôn đè lên toàn bộ */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) setImageBefore(e.target.files[0]);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
                <Box mt={1} fontSize={"16px"} color={"#344054"}>
                  Ảnh trước bảo trì
                </Box>
              </Box>

              {/* Ảnh sau bảo trì */}
              <Box sx={{ position: "relative", width: 240, height: 240 }}>
                {/* Nếu có ảnh thì hiện ảnh, ngược lại hiện Box upload */}
                {imageAfter ? (
                  <img
                    src={URL.createObjectURL(imageAfter)}
                    alt="Ảnh sau"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      background: "#DEEDFE",
                      alignItems: "center",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      p: "20px",
                      borderRadius: "8px",
                      border: "1px dashed #0086C9",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <AddPhotoAlternate
                      sx={{
                        fontSize: "54px",
                        color: "#0086C9",
                        mb: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#0086C9",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                    >
                      Click to upload
                    </Typography>
                    <Typography sx={{ color: "#344054", fontSize: "14px" }}>
                      or drag and drop
                    </Typography>
                  </Box>
                )}

                {/* Ô chọn file luôn đè lên toàn bộ */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) setImageAfter(e.target.files[0]);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
                <Box mt={1} fontSize={"16px"} color={"#344054"}>
                  Ảnh sau bảo trì
                </Box>
              </Box>
            </Box>
          </Box>

          <Box mt={4}>
            <Typography>
              <strong>Kinh độ:</strong> {longitude || "Đang lấy vị trí..."}
            </Typography>
            <Typography>
              <strong>Vĩ độ:</strong> {latitude || "Đang lấy vị trí..."}
            </Typography>
          </Box>

          {/* <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleSubmit}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? "Đang gửi..." : "Gửi yêu cầu bảo trì"}
          </Button> */}
          <ActionButtons onSave={handleSubmit} onCancel={handleBack} />
        </Box>
      </PageContent>
    </PageContainer>
  );
}
