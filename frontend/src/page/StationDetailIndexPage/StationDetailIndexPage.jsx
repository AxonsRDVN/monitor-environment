import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { Header, Footer, Sidebar, StationDetailIndex } from "../../components";
// import { StationStatus } from "../../../components";
import { StationStatus } from "../../components";

const StationDetailIndexPage = () => {
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
        <Sidebar />
        <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
          <Box
            component="main"
            sx={{ backgroundColor: "#f1f1f1", flexGrow: 1 }}
          >
            <StationDetailIndex />
          </Box>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default StationDetailIndexPage;
