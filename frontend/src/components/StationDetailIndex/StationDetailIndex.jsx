import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageContent from "../PageContent/PageContent";
import { AccessTime, Router, Sensors } from "@mui/icons-material";
import ExportChartButton from "../Button/ButtonSave";
import { getDetailIndexLastest } from "../../api/detailIndexApi";
import FormattedTime from "../FormatTime/FormatDateTime";
import ParameterCard from "../Icon/ParameterIcon";
import { useError } from "../../context/ErrorContext";
import ExportButton from "../Button/ExportButton";

export default function StationDetailIndex() {
  const { plantId, stationId } = useParams();
  const [stations, setStations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showError } = useError();
  const { t } = useTranslation("translation");
  const navigate = useNavigate();
  const [detailIndex, setDetailIndex] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("Air");

  useEffect(() => {
    const loadStations = async () => {
      try {
        const res = await getDetailIndexLastest(plantId, stationId);
        setStations(res.station);
        setDetailIndex(res.latest_transaction || null);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin giá trị các chỉ số 😥");
        showError("Không thể kết nối server!");
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [plantId, stationId]);
  console.log("detailIndex", detailIndex);
  console.log("stations", stations);

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: "Trang chủ", path: "/home" },
          { label: "Trạng thái", path: "/monitoring-station" },
          {
            label: stations?.name,
            path: `/dashboard/plant/${plantId}/stations/${stationId}/detail-index-lastest`,
          },
        ]}
      />
      <PageContent
        sx={{
          marginBottom: {
            xs: "100px",
            sm: "0",
          },
          mt: "16px",
        }}
      >
        {detailIndex ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <Box sx={{ color: "#667085" }}>
                {stations.type === "1" ? (
                  <Sensors fontSize="large" />
                ) : (
                  <Router fontSize="large" />
                )}
              </Box>
              <Box sx={{ fontSize: "24px" }}>{stations?.name}</Box>
              <Box sx={{ color: "#D37E0E", fontSize: "16px" }}>
                • Caution(4)
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: "16px", pt: "16px", pb: "32px" }}>
              <AccessTime sx={{ color: "#98A2B3" }} />
              <Box sx={{ color: "#98A2B3" }}>
                Thời gian cập nhật mới nhất:{" "}
                <FormattedTime isoString={detailIndex.time} />
              </Box>
            </Box>
            <Box
              sx={{
                display: {
                  xs: "block", // 👈 màn nhỏ
                  sm: "flex", // 👈 từ màn vừa trở lên
                },
                gap: 3,
                mb: 2,
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {["Gas", "Air", "Light", "Energy", "Other"].map((group) => {
                const count = detailIndex?.groups?.[group]
                  ? Object.keys(detailIndex.groups[group]).length
                  : 0;

                return (
                  <Box
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    sx={{
                      px: 2,
                      py: 1,
                      cursor: "pointer",
                      color: selectedGroup === group ? "#074E9F" : "#344054",
                      borderBottom:
                        selectedGroup === group ? "4px solid #074E9F" : "none",
                      fontSize: 20,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                      "&:hover": {
                        boxShadow: "0px 4px 12px rgba(7, 78, 159, 0.3)",
                        transform: "translateY(-2px)", // tạo cảm giác nổi lên
                      },
                    }}
                  >
                    {group}
                    <Box
                      component="span"
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background:
                          selectedGroup === group ? "#0086C9" : "#E4E7EC",
                        color: selectedGroup === group ? "#fff" : "#98A2B3",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ml: 1,
                      }}
                    >
                      {count}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box
              sx={{
                borderTop: "1px solid #E4E7EC",
                borderBottom: "1px solid #E4E7EC",
                pt: 2,
                pb: 2,
                mb: 4,
              }}
            >
              {detailIndex?.groups?.[selectedGroup] &&
              Object.keys(detailIndex.groups[selectedGroup]).length > 0 ? (
                <Grid
                  container
                  spacing={4} // Tăng spacing từ 3 lên 4 để có thêm khoảng cách giữa các hàng
                >
                  {Object.entries(detailIndex.groups[selectedGroup]).map(
                    ([param, valueObj]) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={2.4}
                        xl={2.4}
                        key={param}
                        sx={{ mt: 2, mb: 2 }}
                      >
                        <ParameterCard
                          paramKey={param}
                          paramData={valueObj}
                          label={t(param)}
                          plantId={plantId}
                          stationId={stationId}
                          navigate={navigate}
                        />
                      </Grid>
                    )
                  )}
                </Grid>
              ) : (
                <Box sx={{ fontStyle: "italic", color: "#888" }}>
                  {t("no_data_to_display_for")} {selectedGroup}
                </Box>
              )}
            </Box>
            <ExportButton />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>{t("no_data_to_display")}</Box>
        )}
      </PageContent>
    </PageContainer>
  );
}
