import axios from "axios";
import { API_BASE } from "./config.api";

export const getAllPlants = async () => {
  const response = await axios.get(`${API_BASE}/monitor-environment/plants/`);
  return response.data;
};