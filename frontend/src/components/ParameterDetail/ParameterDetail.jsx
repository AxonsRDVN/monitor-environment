import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageContent from "../PageContent/PageContent";
import { Box, Typography } from "@mui/material";
import { getDetailIndexLastest } from "../../api/detailIndexApi";
import { ICON_MAP } from "../Icon/ParameterIcon"; // Đảm bảo đúng đường dẫn
import ParameterChartSection from "../Chart/ParameterChartSection";
import { useError } from "../../context/ErrorContext";
import { useTranslation } from "react-i18next";

export default function ParameterDetail() {
  const { plantId, stationId, parameterKey } = useParams();
  const [detailIndex, setDetailIndex] = useState(null);
  const [station, setStation] = useState(null);
  const [error, setError] = useState("");
  const { showError } = useError();
  const { t } = useTranslation("translation");

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getDetailIndexLastest(plantId, stationId);
        setDetailIndex(res.latest_transaction || null);
        setStation(res.station);
      } catch (err) {
        console.error(err);
        setError(t("toast_login_fail"));
        showError(showError(t("can_connect_to_server")));
      }
    };

    loadData();
  }, [plantId, stationId]);

  const groupEntries = detailIndex?.groups || {};

  const parameterData = Object.entries(groupEntries).flatMap(
    ([group, values]) =>
      Object.entries(values).filter(([key]) => key === parameterKey)
  )[0];

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("home_page"), path: "/home" },
          {
            label: t("status"),
            path: `/home/plant/${plantId}/stations`,
          },
          {
            label: station?.name || "",
            path: `/home/plant/${plantId}/stations/${stationId}/detail-index-lastest`,
          },
          {
            label: parameterKey,
            path: `/home/plant/${plantId}/stations/${stationId}/detail-index-lastest/${parameterKey}`,
          },
        ]}
      />
      <PageContent sx={{ marginTop: "16px" }}>
        {parameterData ? (
          <Box>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                color: "#667085",
                gap: "12px",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              {(() => {
                const Icon = ICON_MAP[parameterKey];
                return Icon ? <Icon sx={{ color: "#667085" }} /> : null;
              })()}
              {parameterKey}
            </Typography>
            <ParameterChartSection />
          </Box>
        ) : (
          <Typography color="text.secondary">
            {t("no_data_for_indicator")} {parameterKey}
          </Typography>
        )}
      </PageContent>
    </PageContainer>
  );
}
