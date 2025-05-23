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

export const createSensor = async (payload) => {
  return axios.post(`${API_BASE}/monitor-environment/sensors/`, payload);
};

export const createParameter = async (payload) => {
  return axios.post(`${API_BASE}/monitor-environment/parameters/`, payload);
};

export const cloneSensor = async (sensorId, stationId, plantId) => {
  return axios.post(
    `${API_BASE}/monitor-environment/clone-sensor/${sensorId}/`,
    {
      station_id: stationId,
      plant_id: plantId,
    }
  );
};
