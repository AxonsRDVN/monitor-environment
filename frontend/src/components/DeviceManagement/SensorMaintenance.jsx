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
  Grid,
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
  const role = JSON.parse(localStorage.getItem("user"))?.role_name;

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
    formData.append("action", action);
    formData.append("image_before", imageBefore);
    formData.append("image_after", imageAfter);
    formData.append("user_name", user);
    formData.append("moderator", "Admin");
    formData.append("role", role);
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

  const renderImageUpload = (image, setImage, labelKey) => (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 280,
        height: 240,
        mx: "auto",
        mb: 2,
      }}
    >
      {image ? (
        <img
          src={URL.createObjectURL(image)}
          alt={t(labelKey)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
            border: "1px solid #E4E7EC",
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
            p: 3,
            borderRadius: "8px",
            border: "2px dashed #0086C9",
            width: "100%",
            height: "100%",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "#D6E8FD",
              borderColor: "#0074B7",
            },
          }}
        >
          <AddPhotoAlternate
            sx={{
              fontSize: "48px",
              color: "#0086C9",
              mb: 2,
            }}
          />
          <Typography
            sx={{
              color: "#0086C9",
              fontWeight: "600",
              fontSize: "16px",
              mb: 1,
            }}
          >
            {t("click_to_upload")}
          </Typography>
          <Typography sx={{ color: "#667085", fontSize: "14px" }}>
            {t("or_drag_and_drop")}
          </Typography>
        </Box>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files[0]) setImage(e.target.files[0]);
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

      <Typography
        sx={{
          mt: 2,
          fontSize: "16px",
          color: "#344054",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {t(labelKey)}
      </Typography>
    </Box>
  );

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
    navigate(-1);
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
        {/* Thông tin sensor */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2,
            border: "1px solid #E4E7EC",
            backgroundColor: "#FAFBFC",
            wordBreak: "break-word", // 👈 THÊM DÒNG NÀY
          }}
        >
          <Typography
            sx={{
              mb: 2,
              color: "#344054",
              fontWeight: 700,
              fontSize: { xs: "20px", sm: "22px" },
            }}
          >
            {sensor.model_sensor}
          </Typography>

          <Typography sx={{ fontSize: "16px", color: "#667085" }}>
            {t("factory_farm")}: <strong>{sensor.plant_name}</strong>
          </Typography>
          <Typography sx={{ fontSize: "16px", color: "#667085" }}>
            {t("station")}: <strong>{sensor.station_name}</strong>
          </Typography>
        </Box>

        {/* Select action */}
        <Box sx={{ mb: 4 }}>
          <FormControl sx={{ width: { xs: "100%", sm: "334px" } }}>
            <InputLabel id="action-select-label">{t("action")}</InputLabel>
            <Select
              labelId="action-select-label"
              value={action}
              label={t("action")}
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="maintenance">{t("maintenance")}</MenuItem>
              <MenuItem value="replacement">{t("replacement")}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Upload images và map */}
        <Box
          sx={{
            py: { xs: 3, sm: 4 },
            borderTop: "1px solid #E4E7EC",
            borderBottom: "1px solid #E4E7EC",
          }}
        >
          <Grid container spacing={4} alignItems="flex-start">
            {/* Upload ảnh trước */}
            <Grid item xs={12} sm={6} lg={4}>
              {renderImageUpload(imageBefore, setImageBefore, "before_image")}
            </Grid>

            {/* Upload ảnh sau */}
            <Grid item xs={12} sm={6} lg={4}>
              {renderImageUpload(imageAfter, setImageAfter, "after_image")}
            </Grid>

            {/* Bản đồ */}
            <Grid item xs={12} lg={4}>
              <Box
                sx={{
                  textAlign: "center",
                  maxWidth: 320,
                  mx: "auto",
                }}
              >
                <Typography
                  sx={{
                    mb: 2,
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#344054",
                  }}
                >
                  <strong>{t("your_cordinate")}:</strong>
                </Typography>

                {latitude && longitude ? (
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid #E4E7EC",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <iframe
                      title="Google Map"
                      width="100%"
                      height="240"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=vi&z=16&output=embed`}
                      allowFullScreen
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 240,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed #D0D5DD",
                      borderRadius: 2,
                      backgroundColor: "#F9FAFB",
                    }}
                  >
                    <Typography sx={{ color: "#667085" }}>
                      {t("getting_location")}...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Action buttons */}
        <Box sx={{ mt: 4 }}>
          <ActionButtons
            onSave={handleSubmit}
            onCancel={handleBack}
            saveText={t("save")}
            cancelText={t("cancel")}
            loading={loadingSubmit}
          />
        </Box>
      </PageContent>
    </PageContainer>
  );
}
