import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const levels = ["danger", "caution", "normal"];

const chartData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i.toString().padStart(2, "0")}h`,
  level: levels[Math.floor(Math.random() * 3)],
}));

// Chuyển level thành số để vẽ line
const mappedData = chartData.map((item) => ({
  ...item,
  levelValue: item.level === "normal" ? 2 : item.level === "caution" ? 1 : 0,
}));

export default function LineChartHorizontal() {
  const { t } = useTranslation();
  return (
    <Box sx={{ ml: "-40px" }}>
      <Box sx={{ ml: "30px", color: "#667085" }}>Trạng thái</Box>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={mappedData}
          margin={{ top: 20, right: 0, left: 0, bottom: 10 }}
        >
          {/* Các đường ngang tương ứng với mức độ */}
          <ReferenceLine y={0} stroke="#D0D0D0" strokeWidth={1} />
          <ReferenceLine y={1} stroke="#D0D0D0" strokeWidth={1} />
          <ReferenceLine y={2} stroke="#D0D0D0" strokeWidth={1} />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis
            type="number"
            domain={[0, 2]}
            ticks={[0, 1, 2]}
            width={80}
            tick={({ x, y, payload }) => {
              const value = payload.value;
              let color = "#000";
              if (value === 0) color = "#70DF00"; // normal
              else if (value === 1) color = "#F8BD26"; // caution
              else if (value === 2) color = "#EE3D4A"; // danger

              const label =
                value === 0
                  ? t("normal")
                  : value === 1
                  ? t("caution")
                  : t("danger");

              return (
                <text
                  x={x}
                  y={y}
                  dy={4}
                  fontSize={12}
                  fill={color}
                  textAnchor="end"
                >
                  {label}
                </text>
              );
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "levelValue") {
                const statusLabel =
                  value === 0
                    ? t("normal")
                    : value === 1
                    ? t("caution")
                    : t("danger");
                return [statusLabel, t("status")]; // value, name
              }
              return [value, name];
            }}
            labelFormatter={(label) => `${t("hour")}: ${label}`} // ví dụ dịch "Giờ: 13h"
          />
          <Line
            type="monotone"
            dataKey="levelValue"
            stroke="#1976d2"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
