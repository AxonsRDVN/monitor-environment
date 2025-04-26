import { useTranslation } from "react-i18next";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import PageContainer from "../PageContainer/PageContainer";
import PageTitle from "../PageTitle/PageTitle";
import PageContent from "../PageContent/PageContent";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import ActionButtons from "../Button/ActionButtons";

const API_BASE = "http://192.168.1.22:8000"; // Đổi theo server thật nếu cần

export default function WarningThreshold() {
  const [plants, setPlants] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("translation");

  // Lấy danh sách nhà máy
  useEffect(() => {
    axios.get(`${API_BASE}/monitor-environment/plants/`).then((res) => {
      setPlants(res.data);
      if (res.data.length > 0) {
        setSelectedPlant(res.data[0].id); // chọn mặc định
      }
    });
  }, []);

  // Khi chọn plant → lấy danh sách station
  useEffect(() => {
    if (!selectedPlant) return;

    axios
      .get(`${API_BASE}/monitor-environment/plant/${selectedPlant}/stations`)
      .then((res) => {
        const raw = res.data.stations || [];

        const allStations = [];
        raw.forEach((master) => {
          allStations.push({ id: master.id, name: `(Master) ${master.name}` });
          (master.stations || []).forEach((child) =>
            allStations.push({ id: child.id, name: `↳ ${child.name}` })
          );
        });

        setStations(allStations);
        if (allStations.length > 0) {
          setSelectedStation(allStations[0].id); // ✅ tự chọn station đầu tiên
        } else {
          setSelectedStation("");
        }
        setData([]);
      });
  }, [selectedPlant]);

  // Gọi API dữ liệu khi có station được chọn
  useEffect(() => {
    if (!selectedPlant || !selectedStation) return;

    setLoading(true);
    let url = `${API_BASE}/monitor-environment/parameters/grouped/?plant_id=${selectedPlant}&station_id=${selectedStation}`;

    axios
      .get(url)
      .then((res) => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [selectedPlant, selectedStation]);

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("setting"), path: "/setting/warning_threshold" },
          { label: t("warning_threshold"), path: "/setting/warning_threshold" },
        ]}
      />
      <PageTitle title={"Ngưỡng cảnh báo"} />
      <PageContent
        sx={{
          marginBottom: {
            xs: "100px",
            sm: "0",
          },
        }}
      >
        <Box sx={{ mt: 3 }}>
          {/* Select Plant & Station */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <FormControl fullWidth sx={{ minWidth: 240 }}>
              <InputLabel>Chọn nhà máy</InputLabel>
              <Select
                value={selectedPlant}
                label="Chọn nhà máy"
                onChange={(e) => setSelectedPlant(e.target.value)}
              >
                {plants.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              sx={{ minWidth: 240 }}
              disabled={!stations.length}
            >
              <InputLabel>Chọn trạm</InputLabel>
              <Select
                value={selectedStation}
                label="Chọn trạm"
                onChange={(e) => setSelectedStation(e.target.value)}
              >
                {stations.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Hiển thị kết quả */}
          {loading ? (
            <CircularProgress />
          ) : data.length === 0 ? (
            <Typography>Không có thông số nào có ngưỡng cảnh báo.</Typography>
          ) : (
            data.map((stationGroup) => (
              <Paper key={stationGroup.station_id} sx={{ p: 2, mb: 3 }}>
                <List dense>
                  {stationGroup.parameters.map((param) => (
                    <ListItem
                      key={param.id}
                      divider
                      sx={{ flexDirection: "column", alignItems: "flex-start" }}
                    >
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{
                          color: "#074E9F",
                          fontWeight: "500",
                          fontSize: "24px",
                        }}
                      >
                        {param.name} ({param.min_value}-{param.max_value}){" "}
                        {param.unit || "-"}
                      </Typography>

                      {/* 3 ô Normal - Caution - Danger */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          mb: 2,
                        }}
                      >
                        {/* Ô Normal */}
                        <Box
                          sx={{
                            flex: 1,
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            p: 2,
                            minWidth: 260,
                            bgcolor: "#ffffff",
                          }}
                        >
                          <Typography
                            fontWeight={600}
                            sx={{ color: "#344054", mb: 2 }}
                          >
                            Normal
                          </Typography>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ color: "#344054", mb: 1 }}
                              >
                                Min{" "}
                                <Typography component="span" color="error">
                                  *
                                </Typography>
                              </Typography>
                              <TextField
                                value={param.normal_min}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {param.unit}
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ color: "#344054", mb: 1 }}
                              >
                                Max{" "}
                                <Typography component="span" color="error">
                                  *
                                </Typography>
                              </Typography>
                              <TextField
                                value={param.normal_max}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {param.unit}
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        {/* Ô Caution */}
                        <Box
                          sx={{
                            flex: 1,
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            p: 2,
                            minWidth: 260,
                            bgcolor: "#ffffff",
                          }}
                        >
                          <Typography
                            fontWeight={600}
                            sx={{ color: "#344054", mb: 2 }}
                          >
                            Caution
                          </Typography>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ color: "#344054", mb: 1 }}
                              >
                                Min{" "}
                                <Typography component="span" color="error">
                                  *
                                </Typography>
                              </Typography>
                              <TextField
                                value={param.caution_min}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {param.unit}
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ color: "#344054", mb: 1 }}
                              >
                                Max{" "}
                                <Typography component="span" color="error">
                                  *
                                </Typography>
                              </Typography>
                              <TextField
                                value={param.caution_max}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {param.unit}
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        {/* Ô Danger */}
                        <Box
                          sx={{
                            flex: 1,
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            p: 2,
                            minWidth: 260,
                            bgcolor: "#ffffff",
                          }}
                        >
                          <Typography
                            fontWeight={600}
                            sx={{ color: "#344054", mb: 2 }}
                          >
                            Danger
                          </Typography>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ color: "#344054", mb: 1 }}
                              >
                                Min{" "}
                                <Typography component="span" color="error">
                                  *
                                </Typography>
                              </Typography>
                              <TextField
                                value={param.danger_min}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {param.unit}
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ color: "#344054", mb: 1 }}
                              >
                                Max{" "}
                                <Typography component="span" color="error">
                                  *
                                </Typography>
                              </Typography>
                              <TextField
                                value={param.danger_max}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {param.unit}
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))
          )}
          <ActionButtons />
        </Box>
      </PageContent>
    </PageContainer>
  );
}
