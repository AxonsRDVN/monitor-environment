export const ChartConfig = {
  NumberMinutes: 1440,
  DistanceMinutes: 60,
  ChartType: {
    Temp: "Temp",
    Humi: "Humi",
    Voltage: "Voltage",
    Current: "Current",
    Active_power: "Active_power",
    Frequency: "Frequency",
    Active_engery: "Active_engery",
  },
};

export const LineChartConfig = {
  Temp: {
    title: "report_chart_temp_title",
    title2: "report_chart_temp_title_all",
    toolTipTitle: "report_chart_temp_tool_tip_title",
    xAxisName: "report_chart_temp_x_axis_title",
    yAxisName: "report_chart_temp_y_axis_title",
    xAxisUnit: "h",
    yAxisUnit: "\u00B0C",
    extraValueY: 10,
  },
  Humi: {
    title: "report_chart_humi_title",
    title2: "report_chart_humi_title_all",
    toolTipTitle: "report_chart_humi_tool_tip_title",
    xAxisName: "report_chart_humi_x_axis_title",
    yAxisName: "report_chart_humi_y_axis_title",
    xAxisUnit: "h",
    yAxisUnit: "%",
    extraValueY: 20,
  },
  Voltage: {
    title: "report_chart_humi_title",
    toolTipTitle: "report_chart_humi_tool_tip_title",
    xAxisName: "report_chart_humi_x_axis_title",
    yAxisName: "report_chart_humi_y_axis_title",
    xAxisUnit: "h",
    yAxisUnit: "%",
    extraValueY: 20,
  },
  Current: {
    title: "report_chart_humi_title",
    toolTipTitle: "report_chart_humi_tool_tip_title",
    xAxisName: "report_chart_humi_x_axis_title",
    yAxisName: "report_chart_humi_y_axis_title",
    xAxisUnit: "h",
    yAxisUnit: "%",
    extraValueY: 20,
  },
  Active_power: {
    title: "report_chart_humi_title",
    toolTipTitle: "report_chart_humi_tool_tip_title",
    xAxisName: "report_chart_humi_x_axis_title",
    yAxisName: "report_chart_humi_y_axis_title",
    xAxisUnit: "h",
    yAxisUnit: "%",
    extraValueY: 20,
  },
  Frequency: {
    title: "report_chart_humi_title",
    toolTipTitle: "report_chart_humi_tool_tip_title",
    xAxisName: "report_chart_humi_x_axis_title",
    yAxisName: "report_chart_humi_y_axis_title",
    xAxisUnit: "h",
    yAxisUnit: "%",
    extraValueY: 20,
  },
  Active_engery: {
    title: "report_chart_humi_title",
    toolTipTitle: "report_chart_humi_tool_tip_title",
    xAxisName: "report_chart_humi_x_axis_title",
    yAxisName: "report_chart_humi_y_axis_title",
    xAxisUnit: "h",
    yAxisUnit: "%",
    extraValueY: 20,
  },
};

export const ToastId = {
  CreatePlant: "create-plant-id",
  ConfigPlant: "config-plant-id",
  CreateStorage: "create-storage-id",
  ConfigStorage: "config-storage-id",
  CreateLocation: "create-location-id",
  ConfigLocation: "config-location-id",
  Delete: "delete",
  Login: "login-id",
};

export const AccountConfig = [
  {
    Us_name: process.env.REACT_APP_ADM_US_NAME,
    Pa_word: process.env.REACT_APP_ADM_PA_WORD,
  },
  {
    Us_name: process.env.REACT_APP_ST_US_NAME,
    Pa_word: process.env.REACT_APP_ST_PA_WORD,
  },
];
