import Card from "../../components/common/Card";
import { Receipt, DollarSign, PieChart, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const ProHome = () => {
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand tracking-tight">
            Professional Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Income Tax Regime (Net Profit Basis)
          </p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide">
          Rate: 30%
        </div>
      </div>

      {/* --- METRIC CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Income</p>
              <p className="text-2xl font-bold text-brand">KES 0.00</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Receipt className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Allowable Expenses
              </p>
              <p className="text-2xl font-bold text-brand">KES 0.00</p>
            </div>
          </div>
        </Card>

        <Card className="bg-brand text-white border-none ring-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <PieChart className="w-6 h-6 text-action" />
            </div>
            <div>
              <p className="text-blue-200 text-sm font-medium">
                Est. Tax Payable
              </p>
              <p className="text-2xl font-bold">KES 0.00</p>
            </div>
          </div>
        </Card>
      </div>

      {/* --- ACTION AREA --- */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <h3 className="text-lg font-bold text-brand mb-2">
          File Monthly Return
        </h3>
        <p className="text-slate-500 mb-6 text-sm">
          Upload your income records. We will deduct valid eTIMS expenses
          automatically.
        </p>
        <Link
          to="/filing"
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
        >
          <Upload className="w-5 h-5" />
          Start Filing
        </Link>
      </div>
    </div>
  );
};

export default ProHome;
