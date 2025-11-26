import { useDropzone } from "react-dropzone";
import { UploadCloud, FileSpreadsheet, X } from "lucide-react";
import { useCallback } from "react";

const DragDropZone = ({ onFileSelect, selectedFile, onClear }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  if (selectedFile) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-slate-700">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-2 hover:bg-blue-100 rounded-full transition-colors text-slate-500 hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
        ${
          isDragActive
            ? "border-action bg-green-50 scale-[1.02]"
            : "border-slate-300 hover:border-brand hover:bg-slate-50"
        }
      `}
    >
      <input {...getInputProps()} />
      <div
        className={`p-4 rounded-full shadow-sm mb-4 transition-colors ${
          isDragActive ? "bg-white text-action" : "bg-white text-slate-400"
        }`}
      >
        <UploadCloud className="w-8 h-8" />
      </div>
      <p className="text-lg font-medium text-slate-700 mb-1">
        {isDragActive ? "Drop it here!" : "Click to upload or drag & drop"}
      </p>
      <p className="text-sm text-slate-400">Excel (.xlsx) or CSV files only</p>
    </div>
  );
};

export default DragDropZone;
