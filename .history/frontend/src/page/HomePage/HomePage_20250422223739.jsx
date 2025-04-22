import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { Header, LoginForm, Footer } from "../../components";
import loginBackgroundImg from "../../assets/CPBackGround.jpg";
import "./LoginPage.css";

const Login = () => {
  return (
    <ThemeProvider theme={createTheme()}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Header isAuthen={true} />
        <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
          <MenuTab />
          <Box
            component="main"
            sx={{ backgroundColor: "#f1f1f1", flexGrow: 1 }}
          >
            <DashboardCommon />
          </Box>
        </Box>
        <div>
          <div
            className="dashboard-about-container"
            style={{ display: appContext.showButtonAbousUs ? "block" : "none" }}
            onClick={() => setShowAboutUs(true)}
          >
            <InfoOutlinedIcon sx={{ color: "#074E9F" }} />
            <span className="dashboard-about-title">{t("about")}</span>
          </div>
        </div>
        <Footer />
      </Box>
      <AboutUs showAboutUs={showAboutUs} setShowAboutUs={setShowAboutUs} />
      <MenuTabMobile />
    </ThemeProvider>
  );
};

export default Login;
