import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import English from "./lang/en.json";
import Vietnamese from "./lang/vi.json";
import { LANGUAGE_TYPE } from "./type.js";

const resources = {
  [LANGUAGE_TYPE.ENGLISH]: {
    translation: English,
  },
  [LANGUAGE_TYPE.VIETNAMESE]: {
    translation: Vietnamese,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: LANGUAGE_TYPE.VIETNAMESE, // set default language
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
