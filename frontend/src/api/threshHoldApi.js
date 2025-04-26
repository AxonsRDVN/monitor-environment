import axios from "axios";
import { API_BASE } from "./config.api";

export const getAllSensorsByStation = async (stationId) => {
  const response = await axios.get(
    `${API_BASE}/monitor-environment/thresh-hold/${stationId}`
  );
  return response.data;
};

export const getGroupedParametersThreshHoldByPlant = async (
  plantId,
  stationId
) => {
  let url = `${API_BASE}/monitor-environment/parameters/grouped/?plant_id=${plantId}`;
  if (stationId) {
    url += `&station_id=${stationId}`;
  }
  const response = await axios.get(url);
  return response.data;
};
