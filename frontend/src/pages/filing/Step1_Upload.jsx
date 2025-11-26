import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader, ShieldCheck } from "lucide-react";
import { useFiling } from "../../context/FilingContext";
import { filingApi } from "../../api/filingApi";
import DragDropZone from "../../components/widgets/DragDropZone";
// REMOVED: import Navbar from "../../components/layout/Navbar"; <-- Not needed anymore

const Step1_Upload = () => {
  const navigate = useNavigate();
  const { updateFiling } = useFiling();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const response = await filingApi.uploadFile(file, "November", 2025);

      updateFiling({
        file: file,
        parsedData: response.parsedData || [],
        filingId: response.filingId,
        taxSummary: response.taxSummary,
      });

      navigate("/filing/review", {
        state: {
          parsedData: response.parsedData,
          taxSummary: response.taxSummary,
          filingId: response.filingId,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED JSX (Removed Navbar & Outer Wrappers) ---
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand">Upload Sales Records</h1>
        <p className="text-slate-500 mt-2">
          Step 1 of 3: Let's process your raw data
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {/* Privacy Badge */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Your data is encrypted and processed securely.</span>
        </div>

        {/* File Zone */}
        <DragDropZone
          selectedFile={file}
          onFileSelect={setFile}
          onClear={() => setFile(null)}
        />

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-brand hover:bg-brand-light text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <Loader className="animate-spin w-5 h-5" />
            ) : (
              "Process File"
            )}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1_Upload;
