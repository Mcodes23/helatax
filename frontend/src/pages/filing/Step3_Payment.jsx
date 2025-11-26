import { useNavigate } from "react-router-dom";
import { Copy, ArrowRight } from "lucide-react";
import { useFiling } from "../../context/FilingContext";
import Navbar from "../../components/layout/Navbar";

const Step3_Payment = () => {
  const navigate = useNavigate();
  const { filingData } = useFiling();
  const { taxSummary } = filingData;

  // Safety: If user refreshes and loses data, send them back
  if (!taxSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="mb-4 text-slate-600">No active filing found.</p>
          <button
            onClick={() => navigate("/filing")}
            className="text-blue-600 font-bold hover:underline"
          >
            Start New Filing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand">
            Payment Instructions
          </h1>
          <p className="text-slate-500 mt-2">
            Step 3 of 4: Settle your liability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: The Bill Summary */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-700 mb-6">
              Tax Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Declared Income</span>
                <span className="font-mono font-medium">
                  {taxSummary.income.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Allowable Deductions</span>
                <span className="font-mono font-medium text-red-500">
                  -{taxSummary.expense.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-brand">Total Tax Due</span>
                <span className="text-2xl font-bold text-brand">
                  KES {taxSummary.tax.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
              <strong>Important:</strong> This is an estimate based on the
              Finance Act 2025. Ensure you generate a PRN on iTax before paying.
            </div>
          </div>

          {/* RIGHT: How to Pay */}
          <div className="bg-brand text-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-green-500 h-2 w-2 rounded-full animate-pulse"></span>
              Pay via M-Pesa
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-blue-200 text-xs uppercase font-bold mb-1">
                  Paybill Number
                </p>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                  <span className="font-mono text-xl font-bold tracking-widest">
                    222222
                  </span>
                  <button className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-blue-200 text-xs uppercase font-bold mb-1">
                  Account Number
                </p>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                  <span className="font-mono text-lg">
                    PRN (Generate on iTax)
                  </span>
                </div>
                <p className="text-xs text-blue-300 mt-2">
                  *Login to iTax &gt; Payments &gt; Payment Registration to get
                  your PRN.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/filing/download")} // Moves to final step
              className="w-full mt-8 bg-action hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              I have Paid, Get My File
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3_Payment;
