import axios from "axios";
import { API_BASE } from "./config.api";

export const getAllStationsByPlant = async (plantId) => {
  const response = await axios.get(
    `${API_BASE}/monitor-environment/plant/${plantId}/stations`
  );
  return response.data;
};
