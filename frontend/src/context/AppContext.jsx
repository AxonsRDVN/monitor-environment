import { useState, createContext } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [openMenuTabMobile, setOpenMenuTabMobile] = useState(false);
  const [showButtonAbousUs, setShowButtonAboutUs] = useState(
    window.innerWidth <= 600 ? false : true
  );

  const value = {
    openMenuTabMobile,
    setOpenMenuTabMobile,
    showButtonAbousUs,
    setShowButtonAboutUs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
