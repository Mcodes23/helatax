import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileSpreadsheet, Loader } from "lucide-react";
import DragDropZone from "../../components/widgets/DragDropZone";
import Navbar from "../../components/layout/Navbar";
import { useFiling } from "../../context/FilingContext";
import { filingApi } from "../../api/filingApi";
// Note: We will create the API function for this in the next phase.

const Step3_TemplateUpload = () => {
  const navigate = useNavigate();
  const { filingData } = useFiling();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTemplateUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // 1. Get current filing details from Context
      // We need the ID and the list of confirmed transactions
      const { filingId, parsedData } = filingData;

      if (!filingId || !parsedData) {
        alert("Missing filing data. Please start over.");
        return;
      }

      // 2. Call the Backend
      await filingApi.uploadTemplate(file, filingId, parsedData);

      // 3. Success! Move to Payment
      navigate("/filing/payment");
    } catch (error) {
      console.error("Autofill failed:", error);
      alert(
        "Something went wrong with the autofill process. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand">Upload KRA Template</h1>
          <p className="text-slate-500 mt-2">
            Step 3 of 4: We need the official Excel file to autofill
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm leading-relaxed flex gap-3">
            <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold mb-1">How this works:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>
                  Log in to KRA iTax and download the{" "}
                  <strong>Turnover Tax (TOT)</strong> Excel return.
                </li>
                <li>Do not fill it! Just save it to your computer.</li>
                <li>
                  Upload that <strong>blank Excel file</strong> below.
                </li>
              </ol>
            </div>
          </div>

          {/* Upload Zone */}
          <DragDropZone
            selectedFile={file}
            onFileSelect={setFile}
            onClear={() => setFile(null)}
          />

          {/* Action Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleTemplateUpload}
              disabled={!file || loading}
              className="bg-brand hover:bg-brand-light text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin w-5 h-5" /> Processing...
                </>
              ) : (
                <>
                  Autofill My Return <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3_TemplateUpload;
