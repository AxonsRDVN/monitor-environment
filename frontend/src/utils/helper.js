import i18n from "i18next";
import { LANGUAGE_TYPE } from "../i18n/type";
import { toast } from "react-toastify";

const monthInVietnamese = {
  "01": "Tháng 1",
  "02": "Tháng 2",
  "03": "Tháng 3",
  "04": "Tháng 4",
  "05": "Tháng 5",
  "06": "Tháng 6",
  "07": "Tháng 7",
  "08": "Tháng 8",
  "09": "Tháng 9",
  10: "Tháng 10",
  11: "Tháng 11",
  12: "Tháng 12",
};

const monthInEnglish = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  10: "October",
  11: "November",
  12: "December",
};

export const getMonthNameByLanguage = (month = "01") => {
  let monthName = "";
  if (i18n.language === LANGUAGE_TYPE.VIETNAMESE) {
    monthName = monthInVietnamese[month];
  } else {
    monthName = monthInEnglish[month];
  }

  return monthName;
};

export function initToast(toastId) {
  if (toast.isActive(toastId)) {
    toast.update(toastId, { render: "Đang xử lý ...", isLoading: true });
  } else {
    toast.loading("Đang xử lý ...", { toastId: toastId });
  }
}

export function convert_DD_MM_YYYY_to_YYYY_MM_DD(dateInputStr) {
  let dateArr = dateInputStr?.split("-");
  return dateArr[2] + "-" + dateArr[1] + "-" + dateArr[0];
}
