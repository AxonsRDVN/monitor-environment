import { useTranslation } from "react-i18next";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageContainer from "../PageContainer/PageContainer";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { useEffect, useState } from "react";
import axios from "axios";
import { useError } from "../../context/ErrorContext"; // ✅ nhớ import useError
import {
  Box,
  CircularProgress,
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
import { getAllPlants } from "../../api/plantApi";

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
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await getAllPlants();
        setPlants(res);
        if (res.length > 0) {
          setSelectedPlant(res[0].id);
        }
      } catch (error) {
        console.error(t("toast_login_fail"), error.message);
        showError(t("toast_login_fail"));
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
      async function fetchWarnings() {
        try {
          setLoadingGeneral(true);
          setSensors([]);
          const res = await axios.get(
            `${API_BASE}/monitor-environment/plant/${selectedPlant}/warnings/`,
            {
              params: {
                from_date: fromDate.format("YYYY-MM-DD"),
                to_date: toDate.format("YYYY-MM-DD"),
              },
            }
          );
          setSensors(res.data.stations || []);
        } catch (error) {
          console.error("Lỗi khi load warning:", error.message);
          showError("Không thể tải dữ liệu cảnh báo. Vui lòng thử lại sau!");
        } finally {
          setLoadingGeneral(false);
        }
      }

      fetchWarnings();
    }
  }, [selectedPlant, fromDate, toDate]);

  useEffect(() => {
    if (selectedPlant) {
      async function fetchWarningsDetail() {
        try {
          setLoadingDetail(true);
          setData([]);
          setCount(0);

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
          console.error("Lỗi load warning detail:", error.message);
          showError("Không thể tải dữ liệu cảnh báo chi tiết.");
        } finally {
          setLoadingDetail(false);
        }
      }

      fetchWarningsDetail();
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
          { label: t("report"), path: "/report/warning-indicator" },
          { label: t("warning_index"), path: "/report/warning-indicator" },
        ]}
      />
      <PageTitle title={t("report")} />
      <PageContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            width: { xs: "100%", sm: "75%", md: "75%" }, // 👈 tổng cụm chiếm 50% màn lớn
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            mb: 3,
          }}
        >
          {/* Dropdown chọn nhà máy */}
          <FormControl fullWidth>
            <InputLabel>{t("plant")}</InputLabel>
            <Select
              value={selectedPlant}
              label={t("plant")}
              onChange={(e) => setSelectedPlant(e.target.value)}
            >
              {plants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>
                  {plant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ngày bắt đầu & kết thúc */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                width: "100%",
                gap: 2,
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Typography>{t("report_dropdown_from_date_label")}</Typography>
                <DatePicker
                  value={fromDate}
                  onChange={handleFromDateChange}
                  disabled={isLoading}
                  inputFormat="DD/MM/YYYY"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      fullWidth
                      error={error && error.includes("Ngày bắt đầu")}
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Typography>{t("report_dropdown_to_date_label")}</Typography>
                <DatePicker
                  value={toDate}
                  onChange={handleToDateChange}
                  disabled={isLoading}
                  inputFormat="DD/MM/YYYY"
                  maxDate={dayjs()}
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
              </Box>
            </Box>
          </LocalizationProvider>
        </Box>

        <Box>
          {/* Phần bảng tổng quát */}
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
            <Box sx={{ fontWeight: "600", fontSize: "24px" }}>
              {t("report_detail_sub_title_1")}
            </Box>
          </Box>
          {/* Bảng tổng quát */}
          {loadingGeneral ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : sensors && sensors.length > 0 ? (
            <GeneralWarningIndicatorTable sensors={sensors} />
          ) : (
            <div>{t("no_data_to_display")}</div>
          )}

          {/* Phần bảng chi tiết */}
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
            <Box sx={{ fontWeight: "600", fontSize: "24px" }}>
              {t("report_detail_sub_title_2")}
            </Box>
          </Box>
          {loadingDetail ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : data && data.length > 0 ? (
            <DetailWarningIndicatorTable dataApi={data} />
          ) : (
            <div>{t("no_data_to_display")}</div>
          )}

          {/* Pagination */}
          {count > 1 && !loadingDetail && (
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
