import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { Header, Footer, Sidebar, DeviceStatus } from "../../components";

const DeviceStatusPage = () => {
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
            <DeviceStatus />
          </Box>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default DeviceStatusPage;
