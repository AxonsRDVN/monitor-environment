import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function MapDialog({ open, onClose, latitude, longitude }) {
  const { t } = useTranslation("translation");
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("coordinate")}</DialogTitle>
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
            {t("no_coordinate")}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
