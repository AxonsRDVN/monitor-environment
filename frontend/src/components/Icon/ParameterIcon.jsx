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

export default function ParameterCard({
  paramKey,
  paramData,
  label,
  plantId,
  stationId,
  navigate,
  iconColor = "#0A6EE1", // ✅ default màu nếu không truyền vào
}) {
  const handleClick = () => {
    navigate(
      `/home/plant/${plantId}/stations/${stationId}/detail-index-lastest/${paramKey}`
    );
  };
  return (
    <Box
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        background: "#DEEDFE",
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
          transform: "translateY(-2px)", // tạo cảm giác nổi lên
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {/* Trái: icon + label */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {(() => {
            const Icon = ICON_MAP[paramKey] || BlurOnIcon;
            return <Icon sx={{ color: iconColor }} />;
          })()}
          <Box
            sx={{ fontSize: 18, color: "#0A6EE1", textTransform: "capitalize" }}
          >
            {label}
          </Box>
        </Box>

        {/* Phải: icon mặt cười */}
        <Box sx={{ ml: "auto" }}>
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
        </Box>
      </Box>

      <Box sx={{ fontSize: 24, color: "#212121", fontWeight: 600 }}>
        {paramData?.value} {paramData?.unit}
      </Box>
    </Box>
  );
}
