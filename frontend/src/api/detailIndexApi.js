import axios from "axios";
import { API_BASE } from "./config.api";

export const getDetailIndexLastest = async (plantId, stationId) => {
  const response = await axios.get(
    `${API_BASE}/monitor-environment/plant/${plantId}/station/${stationId}/detail-index-lastest`
  );
  return response.data;
};
