import React, { forwardRef, useImperativeHandle, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Box } from "@mui/material";

const ExportPDFLineChart = forwardRef(
  ({ children, fileName = "export.pdf" }, ref) => {
    const exportRef = useRef();

    useImperativeHandle(ref, () => ({
      exportToPDF: async () => {
        console.log("🟢 Đã gọi exportToPDF"); // DEBUG
        const element = exportRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
        });
        const imageData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imageData);
        const pdfWidth = pageWidth;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (pdfHeight < pageHeight) {
          pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);
        } else {
          pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pageHeight);
        }

        pdf.save(fileName);
      },
    }));

    return (
      <Box ref={exportRef} sx={{ backgroundColor: "#fff", padding: 2 }}>
        {children}
      </Box>
    );
  }
);

export default ExportPDFLineChart;
