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
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import axios from "axios";
import { useError } from "../../context/ErrorContext"; // ✅ Import useError
import ActionButtons from "../Button/ActionButtons";
import { getAllPlants } from "../../api/plantApi";

const API_BASE = process.env.REACT_APP_API_URL;

export default function WarningThreshold() {
  const [plants, setPlants] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [data, setData] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useError();
  const { t } = useTranslation("translation");

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
    if (!selectedPlant) return;

    async function fetchStations() {
      try {
        const res = await axios.get(
          `${API_BASE}/monitor-environment/plant/${selectedPlant}/stations`
        );
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
          setSelectedStation(allStations[0].id);
        } else {
          setSelectedStation("");
        }
        setData([]);
        setEditableData([]);
      } catch (error) {
        console.error(t("toast_login_fail"), error.message);
        showError(t("toast_login_fail"));
        setStations([]);
        setData([]);
        setEditableData([]);
      }
    }
    fetchStations();
  }, [selectedPlant]);

  useEffect(() => {
    if (!selectedPlant || !selectedStation) return;

    async function fetchThresholds() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/monitor-environment/parameters/grouped/?plant_id=${selectedPlant}&station_id=${selectedStation}`
        );
        setData(res.data || []);
        setEditableData(JSON.parse(JSON.stringify(res.data || [])));
      } catch (error) {
        console.error(t("toast_login_fail"), error.message);
        showError(t("toast_login_fail"));
        setData([]);
        setEditableData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchThresholds();
  }, [selectedPlant, selectedStation]);

  const handleInputChange = (indexGroup, indexParam, field, value) => {
    setEditableData((prev) => {
      const newData = [...prev];
      newData[indexGroup].parameters[indexParam][field] = value;
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE}/monitor-environment/parameters/update-thresholds/`,
        {
          data: editableData,
        }
      );
      alert(t("admin_page_toast_success")); // 👉 Nếu muốn đẹp hơn dùng Snackbar hoặc Toast
    } catch (error) {
      console.error(t("toast_login_fail"), error.message);
      showError(t("toast_login_fail"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditableData(JSON.parse(JSON.stringify(data)));
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: t("setting"), path: "/setting/warning_threshold" },
          {
            label: t("warning_threshhold"),
            path: "/setting/warning_threshold",
          },
        ]}
      />
      <PageTitle title={t("warning_threshhold")} />
      <PageContent sx={{ marginBottom: { xs: "100px", sm: "0" } }}>
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
              <InputLabel>{t("plant")}</InputLabel>
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
              <InputLabel>{t("station")}</InputLabel>
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

          {/* Hiển thị dữ liệu */}
          {loading ? (
            <CircularProgress />
          ) : editableData.length === 0 ? (
            <Typography>Không có thông số nào có ngưỡng cảnh báo.</Typography>
          ) : (
            editableData.map((stationGroup, indexGroup) => (
              <Paper key={stationGroup.station_id} sx={{ p: 2, mb: 3 }}>
                <List dense>
                  {stationGroup.parameters.map((param, indexParam) => (
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
                        {t(param.name)} ({param.min_value}-{param.max_value}){" "}
                        {param.unit || "-"}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          mb: 2,
                        }}
                      >
                        {["normal", "caution", "danger"].map((level) => (
                          <Box
                            key={level}
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
                              {t(level)}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <TextField
                                label={t("min")}
                                size="small"
                                fullWidth
                                value={
                                  editableData[indexGroup].parameters[
                                    indexParam
                                  ][`${level}_min`] ?? ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    indexGroup,
                                    indexParam,
                                    `${level}_min`,
                                    e.target.value
                                  )
                                }
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      {param.unit}
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              <TextField
                                label={t("max")}
                                size="small"
                                fullWidth
                                value={
                                  editableData[indexGroup].parameters[
                                    indexParam
                                  ][`${level}_max`] ?? ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    indexGroup,
                                    indexParam,
                                    `${level}_max`,
                                    e.target.value
                                  )
                                }
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
                        ))}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))
          )}

          <ActionButtons
            onSave={handleSave}
            onCancel={handleCancel}
            saveText={t("save")}
            cancelText={t("cancel")}
          />
        </Box>
      </PageContent>
    </PageContainer>
  );
}
