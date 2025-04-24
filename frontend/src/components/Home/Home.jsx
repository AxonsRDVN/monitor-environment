import React, { useEffect, useState } from "react";
import PageContainer from "../PageContainer/PageContainer";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageTitle from "../PageTitle/PageTitle";
import { useTranslation } from "react-i18next";
import PageContent from "../PageContent/PageContent";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";
import SentimentNeutralOutlinedIcon from "@mui/icons-material/SentimentNeutralOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import { getAllPlants } from "../../api/plantApi";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Normal: {
    bg: "#ECF2F8",
    text: "#22AB67",
    iconColor: "#0078B4",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="11.6667" fill="#70DF00" />

        <circle cx="8.5" cy="9.1" r="1.5" fill="#4E3C0C" />

        <circle cx="15.5" cy="9.1" r="1.5" fill="#4E3C0C" />

        <path
          d="M7 14.3C8.1 15.8 9.9 16.7 12 16.7C14.1 16.7 15.9 15.8 17 14.3"
          stroke="#4E3C0C"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    ),
  },
  Caution: {
    bg: "#FDEDE4",
    text: "#D37E0E",
    iconColor: "#DD8108",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="13.8333" cy="14" r="13.3333" fill="#EE3D4A" />

        <circle cx="9.8333" cy="10.6665" r="1.5" fill="#4E3C0C" />

        <circle cx="17.8333" cy="10.6665" r="1.5" fill="#4E3C0C" />

        <path
          d="M7.5 18.5C9.1 16.5 11.3 15.3 13.8333 15.3C16.3667 15.3 18.5667 16.5 20.1667 18.5"
          stroke="#4E3C0C"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    ),
  },
  Danger: {
    bg: "#F8E5E5",
    text: "#C2281D",
    iconColor: "#C2281D",
    icon: (
      <svg
        width="27"
        height="28"
        viewBox="0 0 27 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="13.5" cy="14" r="13.333" fill="#F8BD26" />

        <circle cx="9.5" cy="11.333" r="1.666" fill="#4E3C0C" />

        <circle cx="17.5" cy="11.333" r="1.666" fill="#4E3C0C" />

        <rect
          x="8.16675"
          y="17.3332"
          width="10.6667"
          height="2"
          rx="1"
          fill="#4E3C0C"
        />
      </svg>
    ),
  },
};

const Item = styled(Paper)(({ status }) => ({
  padding: "24px",
  borderRadius: "16px",
  transition: "0.3s",
  height: "100%",
  position: "relative",
  boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.2)",
  },
}));

const factories = [
  {
    id: 1,
    name: "CPV Phu Nghia Further",
    icon: <HomeWorkOutlinedIcon sx={{ fontSize: "48px" }} />,
    status: "Normal",
    station: 13,
    planCode: "0121",
  },
  {
    id: 2,
    name: "CPV Phu Nghia Meat",
    icon: <HomeWorkOutlinedIcon sx={{ fontSize: "48px" }} />,
    status: "Danger",
    station: 15,
    planCode: "0122",
  },
  {
    id: 3,
    name: "CPV Xuan Mai Medicine",
    icon: <HomeWorkOutlinedIcon sx={{ fontSize: "48px" }} />,
    status: "Caution",
    station: 12,
    planCode: "0123",
  },
  {
    id: 4,
    name: "CPV Dong Nai Meat",
    icon: <HomeWorkOutlinedIcon sx={{ fontSize: "48px" }} />,
    status: "Normal",
    station: 14,
    planCode: "0124",
  },
];

export default function Home() {
  const { t } = useTranslation("translation");
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await getAllPlants(); // gọi API
        setPlants(res);
      } catch (err) {
        setError("Không thể tải danh sách nhà máy 😥");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);
  console.log("plants", plants);
  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("dashboard_title"), path: "/home" },
          { label: t("monitoring_station"), path: "/monitoring-station" },
        ]}
      />
      <PageTitle title={"Home Page"} />
      <PageContent sx={{ background: "#F8F9FA", padding: 0 }}>
        <Grid container spacing={3}>
          {plants?.map((plant) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={plant.id}
              sx={{ minWidth: 300 }}
            >
              <Box
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/home/plant/${plant.id}/stations`)}
              >
                <Item status={plant.status}>
                  {/* Icon cảm xúc ở góc phải trên */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      color: statusColors[plant.status]?.text,
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="11.6667" fill="#70DF00" />
                      <circle cx="8.5" cy="9.1" r="1.5" fill="#4E3C0C" />
                      <circle cx="15.5" cy="9.1" r="1.5" fill="#4E3C0C" />
                      <path
                        d="M7 14.3C8.1 15.8 9.9 16.7 12 16.7C14.1 16.7 15.9 15.8 17 14.3"
                        stroke="#4E3C0C"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Box>

                  {/* Dòng ngang chứa icon nhà máy + nội dung */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 2,
                    }}
                  >
                    {/* Icon nhà máy */}
                    <Box
                      sx={{
                        color: statusColors.Normal.iconColor,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: statusColors.Normal.bg,
                        p: 1,
                        borderRadius: "10px",
                      }}
                    >
                      <HomeWorkOutlinedIcon sx={{ fontSize: 48 }} />
                    </Box>

                    {/* Nội dung */}
                    <Box sx={{ textAlign: "left" }}>
                      <Typography
                        fontSize="18px"
                        fontWeight={600}
                        color="#667085"
                      >
                        {plant.name}
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Typography fontSize="16px">
                          Stations: {plant.station}
                        </Typography>
                        <Box
                          sx={{
                            color: statusColors[plant.status]?.text,
                            fontSize: "16px",
                          }}
                        >
                          •
                        </Box>
                        <Typography
                          fontSize="16px"
                          sx={{ color: statusColors.Normal.text }}
                        >
                          Normal
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Item>
              </Box>
            </Grid>
          ))}
        </Grid>
      </PageContent>
    </PageContainer>
  );
}
