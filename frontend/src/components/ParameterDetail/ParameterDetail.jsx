import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { Box, TextField, Typography } from "@mui/material";
import { getDetailIndexLastest } from "../../api/detailIndexApi";
import FormattedTime from "../FormatTime/FormatDateTime";
import ParameterCard, { ICON_MAP } from "../Icon/ParameterIcon"; // Đảm bảo đúng đường dẫn
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ParameterChartSection from "../Chart/ParameterChartSection";

export default function ParameterDetail() {
  const { plantId, stationId, parameterKey } = useParams();
  const [detailIndex, setDetailIndex] = useState(null);
  const [station, setStation] = useState(null);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getDetailIndexLastest(plantId, stationId);
        setDetailIndex(res.latest_transaction || null);
        setStation(res.station);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu chỉ số 😥");
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
          { label: "Dashboard", path: "/home" },
          { label: "Monitoring Station", path: "/monitoring-station" },
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
            Không có dữ liệu cho chỉ số "{parameterKey}"
          </Typography>
        )}
      </PageContent>
    </PageContainer>
  );
}
