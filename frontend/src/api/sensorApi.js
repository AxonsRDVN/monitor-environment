import axios from "axios";
import { API_BASE } from "./config.api";

export const getAllSensorsByStation = async (stationId) => {
  const response = await axios.get(
    `${API_BASE}/monitor-environment/sensors/${stationId}`
  );
  return response.data;
};

export const getOneSensorByStation = async (stationId, sensorId) => {
  const response = await axios.get(
    `${API_BASE}/monitor-environment/sensors/${stationId}/sensor/${sensorId}`
  );
  return response.data;
};
