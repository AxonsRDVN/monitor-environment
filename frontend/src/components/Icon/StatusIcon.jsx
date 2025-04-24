import { Box, Typography } from "@mui/material";

export default function StatusIcon() {
  const statusStyles = {
    Normal: {
      label: "Normal",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="11.6667" fill="#70DF00" />
          <circle cx="8.5" cy="9.1" r="1.5" fill="#4E3C0C" />
          <circle cx="15.5" cy="9.1" r="1.5" fill="#4E3C0C" />
          <path
            d="M7 14.3C8.1 15.8 9.9 16.7 12 16.7C14.1 16.7 15.9 15.8 17 14.3"
            stroke="#4E3C0C"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    Caution: {
      label: "Caution",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="13.8333" cy="14" r="13.3333" fill="#EE3D4A" />
          <circle cx="9.8333" cy="10.6665" r="1.5" fill="#4E3C0C" />
          <circle cx="17.8333" cy="10.6665" r="1.5" fill="#4E3C0C" />
          <path
            d="M7.5 18.5C9.1 16.5 11.3 15.3 13.8333 15.3C16.3667 15.3 18.5667 16.5 20.1667 18.5"
            stroke="#4E3C0C"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    Danger: {
      label: "Danger",
      icon: (
        <svg
          width="27"
          height="28"
          viewBox="0 0 27 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="13.5" cy="14" r="13.333" fill="#F8BD26" />
          <circle cx="9.5" cy="11.333" r="1.666" fill="#4E3C0C" />
          <circle cx="17.5" cy="11.333" r="1.666" fill="#4E3C0C" />
          <rect
            x="8.16675"
            y="17.3332"
            width="10.6667"
            height="2"
            rx="1"
            fill="#4E3C0C"
          />
        </svg>
      ),
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between", // căn đều các item
        alignItems: "center",
        width: "100%", // quan trọng để space-between hoạt động tốt
      }}
    >
      {Object.entries(statusStyles).map(([key, { icon, label }]) => (
        <Box
          key={key}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
        >
          {icon}
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
