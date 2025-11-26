import { CheckCircle, Download, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFiling } from "../../context/FilingContext";
import apiClient from "../../api/axiosConfig"; // Use our configured axios
import Navbar from "../../components/layout/Navbar";

const Step4_Download = () => {
  const navigate = useNavigate();
  const { filingData } = useFiling();

  const handleDownload = async () => {
    try {
      // We request the file from the backend using the filingId
      const response = await apiClient.get(
        `/filing/download/${filingData.filingId}`,
        {
          responseType: "blob", // Important for file downloads
        }
      );

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `KRA_Return_${filingData.filingId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
      alert("Could not download file. Please try again.");
    }
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
          Your tax return data has been processed, formatted, and is ready for
          upload to the KRA iTax portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownload}
            className="bg-brand hover:bg-brand-light text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Download KRA CSV
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          A copy of this return has been saved to your secure audit trail.
        </p>
      </div>
    </div>
  );
};

export default Step4_Download;
