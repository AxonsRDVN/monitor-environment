import React from "react";
import { Box } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import AirIcon from "@mui/icons-material/Air";
import CompressIcon from "@mui/icons-material/Compress";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import LightModeIcon from "@mui/icons-material/LightMode";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import GrainIcon from "@mui/icons-material/Grain";
import BlurOnIcon from "@mui/icons-material/BlurOn"; // Default
import { useTranslation } from "react-i18next";

// ICON cho từng paramKey
export const ICON_MAP = {
  temperature: ThermostatIcon,
  humidity: OpacityIcon,
  windspeed: AirIcon,
  wind_direction: GrainIcon,
  airpressure: CompressIcon,
  rain: WbSunnyIcon,
  noise: GraphicEqIcon,
  radiation: LightModeIcon,
  lux: WbSunnyIcon,
  pm25: GrainIcon,
  pm10: GrainIcon,
};

const getWindDirectionLabel = (degree) => {
  if (degree == null || isNaN(degree)) return "Không xác định";

  const directions = [
    "north",
    "northeast",
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest",
    "north",
  ];
  const index = Math.round(degree / 45);
  return directions[index % 8];
};

// Màu + icon theo status
export const statusColors = {
  normal: {
    bg: "#DEEDFE",
    text: "#0A6EE1",
    iconColor: "#0A6EE1",
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
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  caution: {
    bg: "#FDEDE4",
    text: "#D37E0E",
    iconColor: "#D37E0E",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
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
  danger: {
    bg: "#F8E5E5",
    text: "#C2281D",
    iconColor: "#C2281D",
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
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  unknown: {
    bg: "#DEEDFE",
    text: "#0A6EE1",
    iconColor: "#0A6EE1",
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
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
};

export default function ParameterCard({
  paramKey,
  paramData,
  label,
  plantId,
  stationId,
  navigate,
}) {
  const handleClick = () => {
    navigate(
      `/home/plant/${plantId}/stations/${stationId}/detail-index-lastest/${paramKey}`
    );
  };

  const status = paramData?.status || "unknown"; // nếu thiếu thì cho unknown
  const colorConfig = statusColors[status] || statusColors["unknown"];
  const Icon = ICON_MAP[paramKey] || BlurOnIcon;
  const { t } = useTranslation("translation");

  return (
    <Box
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        background: colorConfig.bg,
        border: "1px solid #ddd",
        borderRadius: 2,
        padding: 2.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        height: "100%",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(7, 78, 159, 0.3)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Icon sx={{ color: colorConfig.iconColor }} />
          <Box
            sx={{
              fontSize: 18,
              fontWeight: 600,
              color: colorConfig.text,
              textTransform: "capitalize",
            }}
          >
            {t(label)}
          </Box>
        </Box>
        <Box sx={{ ml: "auto" }}>{colorConfig.icon}</Box>
      </Box>

      {/* Value */}
      {paramKey === "wind_direction" ? (
        <Box>
          <Box sx={{ fontSize: 24, fontWeight: 600, color: colorConfig.text }}>
            {t(getWindDirectionLabel(paramData?.value))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ fontSize: 24, fontWeight: 600, color: colorConfig.text }}>
          {t(paramData?.value)} {paramData?.unit}
        </Box>
      )}
    </Box>
  );
}
