import axios from "axios";
import { API_BASE } from "./config.api";

export const getAllPlants = async () => {
  const token = localStorage.getItem("accessToken"); // ✅ Lấy token đã lưu

  const response = await axios.get(`${API_BASE}/monitor-environment/plants/`, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Gửi token trong header
    },
  });

  return response.data;
};
