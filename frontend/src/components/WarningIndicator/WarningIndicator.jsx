import { useTranslation } from "react-i18next";
import Breadcrumb from "../BreadCrumb/Breadcrumb";
import PageContainer from "../PageContainer/PageContainer";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { useEffect, useState } from "react";
import axios from "axios";
import { useError } from "../../context/ErrorContext"; // ✅ nhớ import useError
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DetailWarningIndicatorTable from "../Table/DetailWarningIndicatorTable";
import GeneralWarningIndicatorTable from "../Table/GeneralWarningIncaditor";
import { CalendarToday } from "@mui/icons-material";
import Pagination from "@mui/material/Pagination"; // ✅ nhớ import Pagination

const API_BASE = process.env.REACT_APP_API_URL;

export default function WarningIndicator() {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("translation");
  const { showError } = useError(); // ✅ hook show error toast
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await axios.get(`${API_BASE}/monitor-environment/plants/`);
        setPlants(res.data || []);
        if (res.data.length > 0) {
          setSelectedPlant(res.data[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi load plants:", error.message);
        showError("Không thể tải danh sách nhà máy. Vui lòng thử lại sau!");
      }
    }
    fetchPlants();
  }, []);

  useEffect(() => {
    if (selectedPlant) {
      async function fetchWarnings() {
        try {
          setLoading(true);
          setSensors([]); // 🆕 RESET sensors ngay khi đổi nhà máy
          const res = await axios.get(
            `${API_BASE}/monitor-environment/plant/${selectedPlant}/warnings/?from_date=${fromDate.format(
              "YYYY-MM-DD"
            )}&to_date=${toDate.format("YYYY-MM-DD")}`
          );
          setSensors(res.data.stations || []); // Cập nhật dữ liệu mới
        } catch (error) {
          console.error("Lỗi khi load warning:", error.message);
          showError("Không thể tải dữ liệu cảnh báo. Vui lòng thử lại sau!");
        } finally {
          setLoading(false);
        }
      }
      fetchWarnings();
    }
  }, [selectedPlant, fromDate, toDate]);

  useEffect(() => {
    if (selectedPlant) {
      async function fetchWarningsAndDetails() {
        try {
          setLoading(true);

          // 👉 Reset trước khi gọi
          setSensors([]);
          setData([]);
          setCount(0);

          // 📦 Gọi danh sách tổng quát
          const warningRes = await axios.get(
            `${API_BASE}/monitor-environment/plant/${selectedPlant}/warnings/`,
            {
              params: {
                from_date: fromDate.format("YYYY-MM-DD"),
                to_date: toDate.format("YYYY-MM-DD"),
              },
            }
          );
          setSensors(warningRes.data.stations || []);

          // 📦 Gọi danh sách chi tiết
          const detailRes = await axios.get(
            `${API_BASE}/monitor-environment/plant/${selectedPlant}/warning-detail/`,
            {
              params: {
                from_date: fromDate.format("YYYY-MM-DD"),
                to_date: toDate.format("YYYY-MM-DD"),
                page: page,
              },
            }
          );
          setData(detailRes.data.results || []);
          setCount(Math.ceil(detailRes.data.count / 10));
        } catch (error) {
          console.error("Lỗi load warning:", error.message);
          showError("Không thể tải dữ liệu cảnh báo. Vui lòng thử lại sau!");
        } finally {
          setLoading(false);
        }
      }

      fetchWarningsAndDetails();
    }
  }, [selectedPlant, fromDate, toDate, page]);

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
    <PageContainer>
      <Breadcrumb
        items={[
          { label: "Báo cáo", path: "/setting/warning_threshold" },
          { label: "Chỉ số cảnh báo", path: "/setting/warning_threshold" },
        ]}
      />
      <PageTitle title="Chỉ số cảnh báo" />
      <PageContent sx={{ marginBottom: { xs: "100px", sm: "0" } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl sx={{ maxWidth: 250, flex: 1 }}>
            <InputLabel>Chọn nhà máy</InputLabel>
            <Select
              value={selectedPlant}
              label="Chọn nhà máy"
              onChange={(e) => setSelectedPlant(e.target.value)}
            >
              {plants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>
                  {plant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
                  renderInput={(params) => (
                    <TextField {...params} size="small" />
                  )}
                />
              </Box>
            </Box>
          </LocalizationProvider>
        </Box>
        <Box>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              color: "#667085",
              alignItems: "center",
              mb: "28px",
            }}
          >
            <CalendarToday />
            <Box sx={{ fontWeight: "600", fontSize: "24px" }}>Tổng quát</Box>
          </Box>
          <GeneralWarningIndicatorTable sensors={sensors} />

          <Box
            sx={{
              display: "flex",
              gap: "12px",
              color: "#667085",
              alignItems: "center",
              m: "28px 0",
            }}
          >
            <CalendarToday />
            <Box sx={{ fontWeight: "600", fontSize: "24px" }}>Chi tiết</Box>
          </Box>
          <DetailWarningIndicatorTable dataApi={data} />
          {count > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={count}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      </PageContent>
    </PageContainer>
  );
}
