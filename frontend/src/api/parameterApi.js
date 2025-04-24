import axios from "axios";
import { API_BASE } from "./config.api";

export const getParameterByFilter = async (
  plantId,
  stationId,
  parameterKey,
  interval = "hour",
  fromDate = null,
  toDate = null
) => {
  const params = { interval };
  if (fromDate && toDate) {
    params.from_date = fromDate;
    params.to_date = toDate;
  }

  const res = await axios.get(
    `${API_BASE}/monitor-environment/plant/${plantId}/station/${stationId}/filter-index/${parameterKey}/`,
    { params }
  );
  return res.data;
};
