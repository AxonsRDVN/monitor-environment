import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { Header, Footer, Sidebar, ParameterDetail } from "../../components";

const NoPermissionPage = () => {
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "calc(100vh - 120px)", // mặc định
                textAlign: "center",
                px: 2,
                "@media (min-width:1050px)": {
                  minHeight: "calc(100vh - 120px)", // vẫn giữ, nhưng bạn có thể thay đổi nếu cần
                  ml: "280px", // nếu sidebar chiếm 280px
                },
              }}
            >
              <Typography variant="h5" color="error">
                Bạn không có quyền xem trang này
              </Typography>
            </Box>
          </Box>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default NoPermissionPage;
