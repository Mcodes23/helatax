import DashboardLayout from "../components/DashboardLayout";
import { Plus, Upload, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <DashboardLayout>
      {/* 1. SUMMARY CARDS ROW */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Tax Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <AlertCircle size={24} />
            </div>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
              Pending
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Estimated Tax Due
          </h3>
          <p className="text-3xl font-bold text-slate-900">KES 12,500</p>
        </div>

        {/* Card 2: Next Deadline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar size={24} />
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
              20th May
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Next Deadline
          </h3>
          <p className="text-3xl font-bold text-slate-900">4 Days Left</p>
        </div>

        {/* Card 3: Revenue Tracked */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            Total Income (Month)
          </h3>
          <p className="text-3xl font-bold text-slate-900">KES 85,000</p>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Action 1: File Tax */}
        <Link
          to="/file-tax"
          className="group bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-green-200 hover:shadow-xl transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Start New Filing</h3>
              <p className="text-green-100 text-sm">
                Generate P9 or Monthly Return
              </p>
            </div>
          </div>
        </Link>

        {/* Action 2: Upload Docs */}
        <button className="group bg-white border border-slate-200 p-6 rounded-2xl text-slate-700 hover:border-green-500 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-green-50 group-hover:text-green-600 transition">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Upload Documents
              </h3>
              <p className="text-slate-500 text-sm">
                Drag & drop Excel or PDF files
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* 3. RECENT ACTIVITY (Placeholder) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Recent Activity</h2>
          <button className="text-sm text-green-600 font-medium hover:underline">
            View All
          </button>
        </div>
        <div className="p-6 text-center text-slate-400 py-12">
          No filings yet. Start your first tax return above!
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
