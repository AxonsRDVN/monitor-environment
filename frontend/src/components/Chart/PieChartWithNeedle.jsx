/* eslint-disable no-shadow */
import React from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell } from "recharts";

const RADIAN = Math.PI / 180;

const data = [
  { name: "Danger", value: 1, color: "#EE3D4A" },
  { name: "Caution", value: 1, color: "#F8BD26" },
  { name: "Normal", value: 1, color: "#70DF00" },
];

const cx = 150;
const cy = 100;
const iR = 50;
const oR = 100;

// 👉 Hàm tính vị trí kim dựa trên status
const getNeedleValueFromStatus = (status) => {
  switch (status?.toLowerCase()) {
    case "danger":
      return 0.5;
    case "caution":
      return 1.5;
    case "normal":
      return 2.5;
    default:
      return 0.5;
  }
};

// 👉 Hàm vẽ kim
const needle = (value, data, cx, cy, iR, oR, color) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle
      key="needle-center"
      cx={x0}
      cy={y0}
      r={r}
      fill={color}
      stroke="none"
    />,
    <path
      key="needle-path"
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} Z`}
      stroke="none"
      fill={color}
    />,
  ];
};

export default function PieChartWithNeedle({ status = "normal" }) {
  const { t } = useTranslation();
  const value = getNeedleValueFromStatus(status);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
      >
        {t(data[index].name)}
      </text>
    );
  };

  return (
    <PieChart width={300} height={150}>
      <Pie
        dataKey="value"
        startAngle={180}
        endAngle={0}
        data={data}
        cx={cx}
        cy={cy}
        innerRadius={iR}
        outerRadius={oR}
        stroke="none"
        label={renderCustomizedLabel}
        labelLine={false}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      {needle(value, data, cx, cy, iR, oR, "#667085")}
    </PieChart>
  );
}
