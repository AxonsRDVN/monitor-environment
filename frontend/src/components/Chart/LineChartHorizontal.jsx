import { Box } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function LineChartHorizontal({ data = [] }) {
  const { t } = useTranslation();

  // Chuyển dữ liệu từ level ("danger", "caution", "normal") thành levelValue (0, 1, 2)
  const mappedData = data.map((item) => ({
    ...item,
    levelValue: item.level === "danger" ? 0 : item.level === "caution" ? 1 : 2,
  }));

  return (
    <Box sx={{ ml: "-40px" }}>
      <Box
        sx={{
          ml: "30px",
          mt: 2,
          color: "#667085",
          fontSize: {
            xs: "14px",
            sm: "16px",
            md: "18px",
            lg: "20px",
          },
        }}
      >
        {t("status")}
      </Box>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={mappedData}
          margin={{ top: 20, right: 0, left: 0, bottom: 10 }}
        >
          <ReferenceLine y={0} stroke="#D0D0D0" strokeWidth={1} />
          <ReferenceLine y={1} stroke="#D0D0D0" strokeWidth={1} />
          <ReferenceLine y={2} stroke="#D0D0D0" strokeWidth={1} />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis
            type="number"
            reversed
            domain={[0, 2]} // 🔥 Đảo domain: normal ở dưới, danger ở trên
            ticks={[0, 1, 2]} // 🔥 ticks cũng phải theo thứ tự từ trên xuống
            width={80}
            tick={({ x, y, payload }) => {
              const value = payload.value;
              let color = "#000";
              if (value === 0) color = "#EE3D4A"; // danger
              else if (value === 1) color = "#F8BD26"; // caution
              else if (value === 2) color = "#70DF00"; // normal

              const label =
                value === 2
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
                  value === 2
                    ? t("normal")
                    : value === 1
                    ? t("caution")
                    : t("danger");
                return [statusLabel, t("status")];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `${t("hour")}: ${label}`}
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
