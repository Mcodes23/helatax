import { CheckCircle, Download, Home, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFiling } from "../../context/FilingContext";
import apiClient from "../../api/axiosConfig";
import Navbar from "../../components/layout/Navbar";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Step4_Download = () => {
  const navigate = useNavigate();
  const { filingData } = useFiling();

  // 1. NEW: Download Excel Logic
  const handleDownloadExcel = async () => {
    try {
      const response = await apiClient.get(
        `/filing/download/${filingData.filingId}`,
        { responseType: "blob" } // Critical for file downloads
      );

      // Create a blob URL pointing to the Excel file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Force the name to be .xlsx
      link.setAttribute(
        "download",
        `HelaTax_Return_${filingData.filingId}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
      alert("Could not download file. Please try again.");
    }
  };

  // 2. Generate PDF Receipt (Kept same as before)
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const { taxSummary, filingId } = filingData;

    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("HelaTax Filing Receipt", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Filing Reference: ${filingId || "N/A"}`, 14, 28);
    doc.text(`Date Generated: ${new Date().toDateString()}`, 14, 34);

    if (taxSummary) {
      doc.autoTable({
        startY: 45,
        head: [["Item", "Value (KES)"]],
        body: [
          ["Total Declared Income", taxSummary.income.toLocaleString()],
          ["Allowable Expenses", taxSummary.expense.toLocaleString()],
          ["Tax Rate Applied", "Standard Rate (Based on Mode)"],
          ["TOTAL TAX DUE", taxSummary.tax.toLocaleString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 12, cellPadding: 6 },
      });
    }

    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "This document is a summary of your prepared return.",
      14,
      finalY + 10
    );
    doc.text("Please retain this for your records.", 14, finalY + 16);

    doc.save(`Receipt_${filingId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-4xl font-bold text-brand mb-4">Filing Complete!</h1>
        <p className="text-slate-500 max-w-md mb-10">
          Your KRA Excel Return has been autofilled and is ready for upload to
          iTax.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Primary Action: Get the Excel File */}
          <button
            onClick={handleDownloadExcel}
            className="bg-brand hover:bg-brand-light text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Download Filled Excel
          </button>

          {/* Secondary Action: Get Receipt */}
          <button
            onClick={handleDownloadPdf}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            Download Receipt
          </button>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-8 text-slate-400 hover:text-brand text-sm font-medium flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Step4_Download;
