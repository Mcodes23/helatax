import DashboardLayout from "../components/DashboardLayout";
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";

const History = () => {
  // Mock Data to make the app look "lived in"
  const historyData = [
    {
      id: 1,
      date: "2025-05-21",
      type: "Monthly Turnover Tax",
      amount: "KES 100,000",
      tax: "KES 1,500",
      status: "Filed",
      ref: "KRA202505A",
    },
    {
      id: 2,
      date: "2025-04-20",
      type: "Monthly Turnover Tax",
      amount: "KES 85,000",
      tax: "KES 1,275",
      status: "Filed",
      ref: "KRA202504B",
    },
    {
      id: 3,
      date: "2025-03-20",
      type: "Monthly Turnover Tax",
      amount: "KES 120,000",
      tax: "KES 1,800",
      status: "Late",
      ref: "KRA202503C",
    },
    {
      id: 4,
      date: "2024-06-30",
      type: "Annual Income Tax",
      amount: "KES 1,200,000",
      tax: "KES 0 (Nil)",
      status: "Filed",
      ref: "KRA2024YR",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Filing History
            </h2>
            <p className="text-slate-500">
              View all your past declarations and receipts.
            </p>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search reference..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-600">
                  Date Filed
                </th>
                <th className="p-4 text-sm font-bold text-slate-600">
                  Return Type
                </th>
                <th className="p-4 text-sm font-bold text-slate-600">
                  Gross Amount
                </th>
                <th className="p-4 text-sm font-bold text-slate-600">
                  Tax Paid
                </th>
                <th className="p-4 text-sm font-bold text-slate-600">Status</th>
                <th className="p-4 text-sm font-bold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-slate-600 text-sm">{item.date}</td>
                  <td className="p-4 font-medium text-slate-900">
                    {item.type}
                    <div className="text-xs text-slate-400">
                      Ref: {item.ref}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{item.amount}</td>
                  <td className="p-4 text-slate-600 font-mono">{item.tax}</td>
                  <td className="p-4">
                    {item.status === "Filed" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle size={12} /> Filed
                      </span>
                    )}
                    {item.status === "Late" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                        <Clock size={12} /> Late
                      </span>
                    )}
                    {item.status === "Pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        <AlertCircle size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-slate-400 text-sm">
          Only showing records for the last 12 months.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default History;
