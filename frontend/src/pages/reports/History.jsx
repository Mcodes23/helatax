import { useState, useEffect } from "react";
import { FileText, Download, Calendar, Clock, Search } from "lucide-react";
import { filingApi } from "../../api/filingApi";
import apiClient from "../../api/axiosConfig"; // For direct download call

const History = () => {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await filingApi.getHistory();
        if (response.success) {
          setFilings(response.data);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDownload = async (filingId) => {
    try {
      const response = await apiClient.get(`/filing/download/${filingId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Return_${filingId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Download failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand">Filing History</h1>
          <p className="text-slate-500 text-sm">
            Archive of all your past returns.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading records...
          </div>
        ) : filings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-medium mb-1">No filings yet</h3>
            <p className="text-slate-500 text-sm">
              Your tax history will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Period</th>
                <th className="p-4">Date Filed</th>
                <th className="p-4">Turnover</th>
                <th className="p-4">Tax Due</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filings.map((file) => (
                <tr
                  key={file._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4 font-medium text-brand">
                    {file.month} {file.year}
                  </td>
                  <td className="p-4 text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    {file.gross_turnover.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono font-bold text-brand">
                    {file.tax_due.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${
                        file.status === "GENERATED"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : file.status === "DRAFT"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {file.status === "GENERATED" && (
                        <Clock className="w-3 h-3" />
                      )}
                      {file.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDownload(file._id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 ml-auto"
                    >
                      <Download className="w-3 h-3" /> Download CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;
