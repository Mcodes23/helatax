import Card from "../../components/common/Card";
import { TrendingUp, AlertCircle, Upload } from "lucide-react";
import { Link } from "react-router-dom"; // <--- 1. IMPORT THIS

const TraderHome = () => {
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand tracking-tight">
            Trader Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Turnover Tax Regime (3% on Gross Sales)
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide">
          Rate: 3.0%
        </div>
      </div>

      {/* --- METRIC CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Gross Turnover (Nov)
              </p>
              <p className="text-2xl font-bold text-brand">KES 0.00</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Tax Due (by 20th)
              </p>
              <p className="text-2xl font-bold text-green-600">KES 0.00</p>
            </div>
          </div>
        </Card>

        <Card className="bg-brand text-white border-none ring-0">
          <div className="h-full flex flex-col justify-center">
            <p className="text-blue-200 text-xs font-bold uppercase mb-1">
              Status
            </p>
            <p className="text-lg font-semibold">Ready to File</p>
          </div>
        </Card>
      </div>

      {/* --- ACTION AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-brand mb-2">
            File November Return
          </h3>
          <p className="text-slate-500 mb-8 max-w-md">
            Upload your daily sales Excel or CSV file. Our AI will extract the
            totals and calculate your 3% liability instantly.
          </p>

          {/* --- FIX IS HERE: Changed <button> to <Link> --- */}
          <Link
            to="/filing"
            className="bg-brand hover:bg-brand-light text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Sales Record
          </Link>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-4">Trader Tips</h4>
          <ul className="space-y-4 text-sm text-blue-800">
            <li className="flex gap-3">
              <span className="font-bold">•</span>
              <span>
                Turnover Tax is a <strong>final tax</strong>. You do not need to
                file annual returns.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">•</span>
              <span>
                Late penalty is <strong>KES 1,000</strong> per month. File by
                the 20th!
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">•</span>
              <span>
                Expenses are <strong>not deductible</strong>. You pay 3% on
                everything you sell.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TraderHome;
