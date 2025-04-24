import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  TextField,
  Alert,
} from "@mui/material";
import {
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useParams } from "react-router-dom";
import { getParameterByFilter } from "../../api/parameterApi";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const timeOptions = [
  { label: "Phút", value: "minute" },
  { label: "Giờ", value: "hour" },
  { label: "Ngày", value: "day" },
  { label: "Tháng", value: "month" },
];

export default function ParameterChartSection() {
  const { plantId, stationId, parameterKey } = useParams();
  const [selectedTime, setSelectedTime] = useState("hour");
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, max: 0, min: 0 });
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sử dụng useCallback để tránh tạo lại hàm fetchData mỗi lần render
  const fetchData = useCallback(async () => {
    if (!plantId || !stationId || !parameterKey) return;

    // Kiểm tra fromDate và toDate hợp lệ
    if (fromDate.isAfter(toDate)) {
      setError("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await getParameterByFilter(
        plantId,
        stationId,
        parameterKey,
        selectedTime,
        fromDate.format("YYYY-MM-DD"),
        toDate.format("YYYY-MM-DD")
      );
      setSummary(res.summary || { avg: 0, max: 0, min: 0 });
      setChartData(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu biểu đồ:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [plantId, stationId, parameterKey, selectedTime, fromDate, toDate]);

  // Sử dụng useEffect với các dependencies đã được useCallback bao bọc
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Các hàm xử lý thay đổi ngày
  const handleFromDateChange = (newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      setFromDate(newValue);
    }
  };

  const handleToDateChange = (newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      setToDate(newValue);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Chọn khoảng ngày */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography>Từ ngày</Typography>
            <DatePicker
              value={fromDate}
              onChange={handleFromDateChange}
              disabled={isLoading}
              inputFormat="DD/MM/YYYY"
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  error={error && error.includes("Ngày bắt đầu")}
                />
              )}
            />
          </Box>
          <Box>
            <Typography>Đến ngày</Typography>
            <DatePicker
              value={toDate}
              onChange={handleToDateChange}
              disabled={isLoading}
              inputFormat="DD/MM/YYYY"
              maxDate={dayjs()}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </Box>
        </Box>
      </LocalizationProvider>

      {/* Chọn mốc thời gian */}
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={selectedTime}
        onChange={(e, newValue) => {
          if (newValue !== null) setSelectedTime(newValue);
        }}
        sx={{
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
          mb: 4,
        }}
      >
        {timeOptions.map((item) => (
          <ToggleButton
            key={item.value}
            value={item.value}
            disabled={isLoading}
            sx={{
              textTransform: "unset !important",
              flex: 1,
              color:
                selectedTime === item.value
                  ? "#F7FCFA !important"
                  : "#344054 !important",
              backgroundColor:
                selectedTime === item.value
                  ? "#0C4DA0 !important"
                  : "#E7EAED !important",
              "&:hover": {
                backgroundColor:
                  selectedTime === item.value
                    ? "#06397D !important"
                    : "#adb5bd !important",
              },
              fontWeight: 600,
              borderRadius: "8px",
            }}
          >
            {item.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Biểu đồ */}
      <Box sx={{ height: 300, position: "relative" }}>
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 10,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="0" vertical={false} />
              <XAxis dataKey="grouped_time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="avg_value"
                fill="#1976d2"
                stroke="none"
                fillOpacity={0.3}
              />
              <Line
                type="monotone"
                dataKey="avg_value"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #ccc",
              borderRadius: "4px",
            }}
          >
            <Typography color="text.secondary">
              {!error && !isLoading ? "Không có dữ liệu để hiển thị" : ""}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Chỉ số thống kê */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          mt: 2,
          mb: 2,
          flexWrap: "nowrap",
          justifyContent: "space-between",
          textAlign: "center",
          alignItems: "center",
        }}
      >
        {[
          { label: "Trung bình", value: summary.avg },
          { label: "Lớn nhất", value: summary.max },
          { label: "Nhỏ nhất", value: summary.min },
        ].map((item, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              ...(i === 1 && {
                borderRight: "1px solid #E0E0E0",
                borderLeft: "1px solid #E0E0E0",
              }),
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                color: "#667085",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </Typography>
            <Typography
              sx={{ fontSize: 24, fontWeight: 600, color: "#074E9F" }}
            >
              {typeof item.value === "number" ? item.value.toFixed(2) : "0.00"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
