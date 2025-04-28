import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";

export default function MapDialog({ open, onClose, latitude, longitude }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Bản đồ vị trí</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {latitude && longitude ? (
          <iframe
            title="Google Map"
            width="100%"
            height="500"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=vi&z=16&output=embed`}
            allowFullScreen
          />
        ) : (
          <Typography variant="body2" sx={{ p: 2 }}>
            Không có thông tin tọa độ.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
