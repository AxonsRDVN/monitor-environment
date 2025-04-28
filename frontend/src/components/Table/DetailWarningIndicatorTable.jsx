import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import dayjs from "dayjs";

export default function DetailWarningIndicatorTable({ dataApi }) {
  let stt = 1;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead
          color="primary"
          sx={{ background: "#DEEDFE", color: "#0A6EE1" }}
        >
          <TableRow
            color="primary"
            sx={{ background: "#DEEDFE", color: "#0A6EE1" }}
          >
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: "16px" }}
            >
              STT
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: "16px" }}
            >
              Trạm
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: "16px" }}
            >
              Chỉ số
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: "16px" }}
            >
              Giá trị
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: "16px" }}
            >
              Trạng thái
            </TableCell>
            <TableCell
              sx={{ color: "#0A6EE1", fontWeight: "600", fontSize: "16px" }}
            >
              Thời gian
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataApi?.map((data) => (
            <React.Fragment key={data.id}>
              <TableRow>
                <TableCell>{stt++}</TableCell>
                <TableCell>{data.station_name || "-"}</TableCell>
                <TableCell>{data.parameter_name || "-"}</TableCell>
                <TableCell>
                  {data.value} {data.unit}
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "inline-block",
                      padding: "4px 12px",
                      backgroundColor:
                        data.status === "danger" ? "#F8E5E5" : "#FEF3E5",
                      color: data.status === "danger" ? "#C2281D" : "#DD8108",
                      borderRadius: "999px",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {data.status === "danger" ? "Nguy hiểm" : "Cảnh báo"}
                  </Box>
                </TableCell>

                <TableCell align="center">
                  {data.time
                    ? dayjs(data.time).format("DD/MM/YYYY HH:mm:ss")
                    : "-"}
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
