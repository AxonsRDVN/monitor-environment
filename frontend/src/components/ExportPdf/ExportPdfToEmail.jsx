// components/Dialog/ExportDialog.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ActionButtons from "../Button/ActionButtons";

export default function ExportDialog({ open, onClose, onConfirm }) {
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [customEmail, setCustomEmail] = useState("");
  const [defaultEmail, setDefaultEmail] = useState("");
  const [sendToDefault, setSendToDefault] = useState(true);
  const [sendToCustom, setSendToCustom] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setDefaultEmail(email);
  }, []);

  // Reset state khi dialog mở lại
  useEffect(() => {
    if (open) {
      const email = localStorage.getItem("email");
      if (email) setDefaultEmail(email);
    }
  }, [open]);

  const handleConfirm = () => {
    const selectedEmail = sendToDefault ? defaultEmail : customEmail;

    if (!selectedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedEmail)) {
      alert("Email không hợp lệ!");
      return;
    }

    onConfirm({
      fromDate,
      toDate,
      email: selectedEmail,
    });
    onClose();
  };

  const handleEmailTypeChange = (type, checked) => {
    if (type === "default") {
      setSendToDefault(checked);
      if (checked) setSendToCustom(false);
    } else {
      setSendToCustom(checked);
      if (checked) setSendToDefault(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle align="center" fontWeight={600}>
        Export Data
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ mb: 2, mt: 2 }}>
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              format="DD/MM/YYYY"
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  size="medium"
                  error={error && error.includes("Ngày bắt đầu")}
                />
              )}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              format="DD/MM/YYYY"
              renderInput={(params) => (
                <TextField {...params} fullWidth size="medium" />
              )}
            />
          </Box>
        </LocalizationProvider>

        <FormControlLabel
          control={
            <Checkbox
              checked={sendToDefault}
              onChange={(e) =>
                handleEmailTypeChange("default", e.target.checked)
              }
            />
          }
          label="Gửi đến email mặc định"
        />

        <TextField
          fullWidth
          label="Email mặc định"
          value={defaultEmail}
          margin="dense"
          disabled
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={sendToCustom}
              onChange={(e) =>
                handleEmailTypeChange("custom", e.target.checked)
              }
            />
          }
          label="Gửi đến email tùy chọn"
        />

        <TextField
          fullWidth
          label="Email tùy chọn"
          margin="dense"
          value={customEmail}
          onChange={(e) => setCustomEmail(e.target.value)}
          disabled={!sendToCustom}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
        <ActionButtons onCancel={onClose} onSave={handleConfirm} />
      </DialogActions>
    </Dialog>
  );
}
