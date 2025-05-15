import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AirIcon from "@mui/icons-material/Air";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import Co2Icon from "@mui/icons-material/Co2";
import DeviceUnknownIcon from "@mui/icons-material/DeviceUnknown";

export const getParameterIcon = (name) => {
  switch (name) {
    case "temperature":
      return <ThermostatIcon sx={{ mr: 1, color: "#074E9F" }} />;
    case "humidity":
      return <WaterDropIcon sx={{ mr: 1, color: "#074E9F" }} />;
    case "pm25":
    case "pm10":
      return <AirIcon sx={{ mr: 1, color: "#074E9F" }} />;
    case "noise":
      return <GraphicEqIcon sx={{ mr: 1, color: "#074E9F" }} />;
    case "co2":
      return <Co2Icon sx={{ mr: 1, color: "#074E9F" }} />;
    default:
      return <DeviceUnknownIcon sx={{ mr: 1, color: "#074E9F" }} />;
  }
};
