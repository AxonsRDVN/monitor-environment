import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllStationsByPlant } from "../../api/stationApi";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import SearchIcon from "@mui/icons-material/Search";
import { PictureAsPdf, Route, Router, Sensors } from "@mui/icons-material";
import PieChartWithNeedle from "../Chart/PieChartWithNeedle";
import LineChartHorizontal from "../Chart/LineChartHorizontal";
import StatusIcon from "../Icon/StatusIcon";
import ExportChartButton from "../Button/ExportChartButton";

export default function StationStatus() {
  const { plantId } = useParams();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation("translation");
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [plantName, setPlantName] = useState("");

  useEffect(() => {
    const loadStations = async () => {
      try {
        const res = await getAllStationsByPlant(plantId);
        setStations(res.stations);
        setPlantName(res.plant_name);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách trạm 😥");
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [plantId]);
  const filteredStations = stations
    .map((master) => {
      const lowerSearch = searchText.toLowerCase();

      const masterMatch =
        master.name.toLowerCase().includes(lowerSearch) ||
        master.code.toLowerCase().includes(lowerSearch);

      const filteredSubStations = master.stations.filter(
        (station) =>
          station.name.toLowerCase().includes(lowerSearch) ||
          station.code.toLowerCase().includes(lowerSearch)
      );

      // Nếu master khớp => giữ nguyên toàn bộ sub station
      if (masterMatch) return { ...master };
      // Nếu không, chỉ giữ lại các sub station khớp
      if (filteredSubStations.length > 0) {
        return { ...master, stations: filteredSubStations };
      }

      return null;
    })
    .filter(Boolean); // loại bỏ null
  console.log("filteredStations", filteredStations);
  console.log("stations", stations);
  console.log("plantName", plantName);

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("dashboard_title"), path: "/home" },
          { label: t("monitoring_station"), path: "/monitoring-station" },
        ]}
      />
      <PageTitle title={plantName} />
      <PageContent
        sx={{
          marginBottom: {
            xs: "100px",
            sm: "0",
          },
        }}
      >
        <TextField
          label={t("search")}
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2, width: "340px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            width: "100%",
          }}
        >
          {/* LEFT: Station List */}
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: "100%", md: "350px" },
            }}
          >
            <List
              sx={{
                bgcolor: "#F9FAFB",
                borderRadius: 3,
                border: "1px solid #E0E0E0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              {filteredStations?.length === 0 ? (
                <ListItem>
                  <ListItemText
                    sx={{
                      background: "white",
                      borderRadius: 2,
                      p: 2,
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                    primary={
                      t("no_station_found") || "Không tìm thấy trạm phù hợp"
                    }
                  />
                </ListItem>
              ) : (
                filteredStations.map((master) => (
                  <React.Fragment key={master.id}>
                    {/* Master item */}
                    <ListItem disablePadding>
                      <Box
                        onClick={() =>
                          navigate(
                            `/home/plant/${plantId}/stations/${master.id}/detail-index-lastest`
                          )
                        }
                        sx={{
                          background: "white",
                          borderRadius: 2,
                          p: 2.5,
                          m: "8px",
                          cursor: "pointer",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                          transition: "0.2s",
                          "&:hover": {
                            boxShadow: "0px 4px 12px rgba(7, 78, 159, 0.3)",
                            transform: "translateY(-2px)", // tạo cảm giác nổi lên
                          },
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: "#DEEDFE",
                            color: "#0A6EE1",
                            p: 1,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Router sx={{ fontSize: 24 }} />
                        </Box>

                        <ListItemText
                          primaryTypographyProps={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#344054",
                          }}
                          secondaryTypographyProps={{
                            fontSize: 13,
                            color: "#6B7280", // xám nhẹ
                          }}
                          primary={master.name}
                          secondary={`node : ${master.stations?.length || 0}`}
                        />
                      </Box>
                    </ListItem>

                    {/* Station dưới master */}
                    {master.stations?.map((station) => (
                      <ListItem key={station.id} sx={{ pl: 6 }}>
                        <Box
                          onClick={() =>
                            navigate(
                              `/home/plant/${plantId}/stations/${station.id}/detail-index-lastest`
                            )
                          }
                          sx={{
                            background: "white",
                            borderRadius: 2,
                            p: 2,
                            cursor: "pointer",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            transition: "0.2s",
                            "&:hover": {
                              boxShadow: "0px 4px 12px rgba(7, 78, 159, 0.3)",
                              transform: "translateY(-2px)", // tạo cảm giác nổi lên
                            },
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: "#DEEDFE",
                              color: "#0A6EE1",
                              p: 1,
                              borderRadius: "5px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                            }}
                          >
                            <Sensors sx={{ fontSize: 20 }} />
                          </Box>

                          <ListItemText
                            primaryTypographyProps={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#344054",
                            }}
                            primary={station.name}
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </React.Fragment>
                ))
              )}
            </List>
          </Box>

          {/* RIGHT: Nội dung khác */}
          <Box
            sx={{
              flex: 2,
              p: 3,
              background: "#fff",
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              minHeight: 200,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <svg
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.25 0C1.01 0 0 1.01 0 2.25V17.75C0 18.99 1.01 20 2.25 20H13.75C14.9905 20 16 18.9905 16 17.75V7.25C16 7.0425 15.9159 6.85535 15.7803 6.71973L9.28027 0.219727C9.14465 0.0841016 8.9575 0 8.75 0H2.25ZM2.25 1.5H8V5.75C8 6.99 9.01 8 10.25 8H14.5V17.75C14.5 18.1635 14.1635 18.5 13.75 18.5H2.25C1.835 18.5 1.5 18.165 1.5 17.75V2.25C1.5 1.835 1.835 1.5 2.25 1.5ZM9.5 2.56055L13.4395 6.5H10.25C9.835 6.5 9.5 6.165 9.5 5.75V2.56055ZM12 10.5C11.7459 10.5002 11.5015 10.5972 11.3163 10.7711C11.1311 10.9451 11.0191 11.183 11.0029 11.4365L9 13.4395L7.49707 11.9365C7.48094 11.683 7.36891 11.4451 7.18372 11.2711C6.99853 11.0972 6.75407 11.0002 6.5 11C6.24593 11.0002 6.00147 11.0972 5.81628 11.2711C5.63109 11.4451 5.51906 11.683 5.50293 11.9365L3.93652 13.5029C3.67963 13.5224 3.44016 13.6402 3.26802 13.8319C3.09589 14.0236 3.00438 14.2743 3.01256 14.5318C3.02075 14.7893 3.128 15.0337 3.31196 15.2141C3.49591 15.3945 3.74239 15.4969 4 15.5C4.25407 15.4998 4.49853 15.4028 4.68372 15.2289C4.86891 15.0549 4.98094 14.817 4.99707 14.5635L6.5 13.0605L8.00293 14.5635C8.01906 14.817 8.13109 15.0549 8.31628 15.2289C8.50147 15.4028 8.74593 15.4998 9 15.5C9.25407 15.4998 9.49853 15.4028 9.68372 15.2289C9.86891 15.0549 9.98094 14.817 9.99707 14.5635L12.0635 12.4971C12.3204 12.4776 12.5598 12.3598 12.732 12.1681C12.9041 11.9764 12.9956 11.7257 12.9874 11.4682C12.9793 11.2107 12.872 10.9663 12.688 10.7859C12.5041 10.6055 12.2576 10.5031 12 10.5Z"
                    fill="#667085"
                  />
                </svg>
                <Typography>Biểu đồ trạng thái</Typography>
              </Box>
              <ExportChartButton />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <PieChartWithNeedle status="Normal" />
            </Box>
            <Box>
              <LineChartHorizontal
                titleLineChart={t("admin_page_sub_table_status")}
              />
            </Box>
            <Box sx={{ textAlign: "center", marginBottom: "32px" }}>
              24 giờ qua
            </Box>
            <StatusIcon />
          </Box>
        </Box>
      </PageContent>
    </PageContainer>
  );
}
