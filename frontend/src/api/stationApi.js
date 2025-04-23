import axios from "axios";
import { API_BASE } from "./config.api";

export const getAllStationsByPlant = async (selectedPlant) => {
  const response = await axios.get(
    `${API_BASE}/monitor-environment/plants/${selectedPlant}/stations`
  );
  return response.data;
};
