import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllPlants } from "../../api/plantApi";
import { useError } from "../../context/ErrorContext";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { statusColors } from "../Icon/ParameterIcon";

const Item = styled(Paper)(({ status }) => ({
  padding: "20px",
  borderRadius: "16px",
  transition: "0.3s",
  height: "100%",
  position: "relative",
  boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  cursor: "pointer",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0px 4px 14px rgba(0,0,0,0.2)",
  },
}));

export default function Home() {
  const { t } = useTranslation("translation");
  const { showError } = useError();
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await getAllPlants();
        setPlants(res);
      } catch (err) {
        showError(showError(t("can_connect_to_server")));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, []);

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: t("home_page"), path: "/home" }]} />
      <PageTitle title={t("home_page")} />
      {loading ? (
        <CircularProgress />
      ) : (
        <PageContent sx={{ background: "#F8F9FA", padding: 0 }}>
          <Grid container spacing={3} alignItems="stretch">
            {plants.map((plant) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={plant.id}>
                <Item
                  status={plant.status}
                  onClick={() => navigate(`/home/plant/${plant.id}/stations`)}
                >
                  {/* Icon trạng thái ở góc */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      color: statusColors[plant.status]?.text,
                    }}
                  >
                    {statusColors[plant.status]?.icon}
                  </Box>

                  {/* Nội dung chính */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: statusColors[plant.status]?.bg,
                        color: statusColors[plant.status]?.iconColor,
                        p: 1,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <HomeWorkOutlinedIcon sx={{ fontSize: 48 }} />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        fontSize="16px"
                        fontWeight={600}
                        color="#344054"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {plant.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography fontSize="14px" color="#667085">
                          {t("stations")}: {t(plant.station_count) || 0}
                        </Typography>
                        <Typography
                          fontSize="14px"
                          color={statusColors[plant.status]?.text}
                        >
                          • {t(plant.status)}
                          {plant.count > 0 && ` (${plant.count})`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Item>
              </Grid>
            ))}
          </Grid>
        </PageContent>
      )}
    </PageContainer>
  );
}
