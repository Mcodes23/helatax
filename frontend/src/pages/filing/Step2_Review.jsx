import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Trash2, AlertCircle } from "lucide-react";
import { useFiling } from "../../context/FilingContext";
import Navbar from "../../components/layout/Navbar";

const Step2_Review = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filingData, updateFiling } = useFiling();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, tax: 0 });

  // 1. Load data on mount
  useEffect(() => {
    // Case A: Data passed via Navigation (Fresh Upload)
    if (location.state?.parsedData) {
      console.log("Loaded data from Navigation State");
      setTransactions(location.state.parsedData);

      // ✅ FIX: Only update Context if the ID is different (Prevents Loop)
      if (filingData.filingId !== location.state.filingId) {
        updateFiling({
          parsedData: location.state.parsedData,
          taxSummary: location.state.taxSummary,
          filingId: location.state.filingId,
        });
      }
    }
    // Case B: Data exists in Context (Refresh/Back Button)
    else if (filingData?.parsedData?.length > 0) {
      console.log("Loaded data from Context");
      setTransactions(filingData.parsedData);
    } else {
      console.warn("No data found, redirecting...");
      // navigate('/filing');
    }
  }, [location.state, filingData.filingId, navigate, updateFiling]);

  // 2. Auto-Calculate Totals
  useEffect(() => {
    let inc = 0;
    let exp = 0;
    let wht = 0;

    transactions.forEach((t) => {
      const amount = parseFloat(t.amount || 0);
      if (t.type === "INCOME") {
        inc += amount;
        if (t.wht_deducted) wht += amount * 0.05;
      } else {
        exp += amount;
      }
    });

    // 3% Turnover Tax Logic
    let estimatedTax = inc * 0.03 - wht;
    if (estimatedTax < 0) estimatedTax = 0;

    setSummary({ income: inc, expense: exp, tax: estimatedTax });
  }, [transactions]);

  // --- HANDLERS ---
  const handleRowChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  };

  const handleDelete = (index) => {
    const updated = transactions.filter((_, i) => i !== index);
    setTransactions(updated);
  };

  const handleProceed = () => {
    updateFiling({
      parsedData: transactions,
      taxSummary: summary,
    });
    navigate("/filing/payment");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand">Review Data</h1>
            <p className="text-slate-500 mt-1">
              Step 2 of 3: Verify your transactions
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">
              Est. Tax Due
            </p>
            <p className="text-3xl font-bold text-brand">
              KES {summary.tax.toLocaleString()}
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">
              Total Income
            </p>
            <p className="text-xl font-bold text-green-600">
              + {summary.income.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">
              Allowable Expenses
            </p>
            <p className="text-xl font-bold text-red-500">
              - {summary.expense.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-500 uppercase">
              Tax Mode
            </p>
            <p className="text-xl font-bold text-blue-700">Trader (3%)</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4 border-b">Date</th>
                  <th className="p-4 border-b">Description</th>
                  <th className="p-4 border-b">Type</th>
                  <th className="p-4 border-b">Amount (KES)</th>
                  <th className="p-4 border-b text-center">WHT Paid? (5%)</th>
                  <th className="p-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="text"
                        value={
                          row.date
                            ? new Date(row.date).toISOString().split("T")[0]
                            : ""
                        }
                        className="bg-transparent w-28 outline-none text-slate-500"
                        readOnly
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          handleRowChange(index, "description", e.target.value)
                        }
                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-blue-300 focus:bg-white transition-colors"
                      />
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          row.type === "INCOME"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-medium">
                      <input
                        type="number"
                        value={row.amount}
                        onChange={(e) =>
                          handleRowChange(index, "amount", e.target.value)
                        }
                        className="w-24 bg-transparent outline-none border-b border-transparent focus:border-blue-300 focus:bg-white transition-colors"
                      />
                    </td>
                    <td className="p-3 text-center">
                      {row.type === "INCOME" && (
                        <input
                          type="checkbox"
                          checked={row.wht_deducted || false}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "wht_deducted",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-brand rounded focus:ring-action cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate("/filing")}
            className="flex items-center gap-2 text-slate-500 hover:text-brand font-medium px-4 py-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Upload
          </button>
          <button
            onClick={handleProceed}
            disabled={transactions.length === 0}
            className="bg-brand hover:bg-brand-light text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            Confirm & Calculate
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2_Review;
