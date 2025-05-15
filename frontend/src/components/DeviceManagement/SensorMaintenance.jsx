import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
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
  const user = JSON.parse(localStorage.getItem("user"))?.full_name;
  const role = JSON.parse(localStorage.getItem("user"))?.role;

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
        showError(showError(t("can_connect_to_server")));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sensorId, stationId]);

  const handleSubmit = async () => {
    if (!imageBefore || !imageAfter) {
      alert(t("upload_before_after_required"));
      return;
    }

    const fixedLatitude = latitude ? latitude.toFixed(6) : null;
    const fixedLongitude = longitude ? longitude.toFixed(6) : null;

    const formData = new FormData();
    formData.append("sensor", sensorId);
    formData.append("action", action); // Mặc định là bảo trì, nếu có thêm thay thế sau này thì sửa
    formData.append("image_before", imageBefore);
    formData.append("image_after", imageAfter);
    formData.append("user_name", user); // Nếu có user đăng nhập thì thay bằng tên user thực tế
    formData.append("moderator", "Admin"); // Nếu cần chọn thì thêm input, hiện hardcode
    formData.append("role", role); // Lắp đặt, hoặc lấy từ login
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
      alert(t("submit_success"));
      navigate(`/device-management/history/${sensorId}`);
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      alert(t("submit_failed"));
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
        <Typography variant="h6">{t("no_sensor")}</Typography>
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
          { label: t("device_management"), path: "/device-management" },
          { label: t("maintenance"), path: "/device-management" },
        ]}
      />
      <PageTitle title={t("maintenance")} />
      <PageContent>
        <Box mb={2} color={"#344054"} fontWeight={"700"} fontSize={"22px"}>
          {sensor.model_sensor}
        </Box>
        <Box mb={2}>
          {t("factory_farm")}: <strong>{sensor.plant_name}</strong>
        </Box>
        <Box mb={2}>
          {t("station")}: <strong>{sensor.station_name}</strong>
        </Box>
        <Box mt={2}>
          <FormControl sx={{ mt: 2, width: "334px" }}>
            <InputLabel id="action-select-label">{t("action")}</InputLabel>
            <Select
              labelId="action-select-label"
              value={action}
              label="Hành động"
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="maintenance">{t("maintenance")}</MenuItem>
              <MenuItem value="replacement">{t("replacement")}</MenuItem>
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
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", gap: 4 }}>
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
                        {t("click_to_upload")}
                      </Typography>
                      <Typography sx={{ color: "#344054", fontSize: "14px" }}>
                        {t("or_drag_and_drop")}
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
                    {t("before_image")}
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
                        {t("click_to_upload")}
                      </Typography>
                      <Typography sx={{ color: "#344054", fontSize: "14px" }}>
                        {t("or_drag_and_drop")}
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
                    {t("after_image")}
                  </Box>
                </Box>
              </Box>
              <Box>
                <Typography>
                  <strong>{t("your_cordinate")}:</strong>{" "}
                </Typography>
                {latitude && longitude && (
                  <iframe
                    title="Google Map"
                    width="100%"
                    height="auto"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=vi&z=16&output=embed`}
                    allowFullScreen
                  ></iframe>
                )}
              </Box>
            </Box>
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
          <ActionButtons
            onSave={handleSubmit}
            onCancel={handleBack}
            saveText={t("save")}
            cancelText={t("cancel")}
          />
        </Box>
      </PageContent>
    </PageContainer>
  );
}
