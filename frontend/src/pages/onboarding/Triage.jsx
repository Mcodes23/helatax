import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Briefcase,
  Stethoscope,
  Laptop,
  ArrowRight,
  AlertTriangle,
  Loader, // <--- Added Loader import
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Card from "../../components/common/Card";
import { authApi } from "../../api/authApi"; // <--- Import API

const Triage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null); // 'TRADER' or 'PROFESSIONAL'
  const [profession, setProfession] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // <--- Added Loading State

  // The Forbidden List (Client-Side Check for immediate feedback)
  const forbiddenKeywords = [
    "doctor",
    "engineer",
    "consultant",
    "lawyer",
    "architect",
  ];

  const handleContinue = async () => {
    if (!selectedRole) {
      setError("Please select a category to continue.");
      return;
    }

    // 1. The Logic Check (Client Side)
    if (
      selectedRole === "TRADER" &&
      forbiddenKeywords.some((k) => profession.toLowerCase().includes(k))
    ) {
      setError(
        "⚠️ Regulatory Warning: As a Professional, you are legally barred from Turnover Tax (Sec 12C). Please select 'Professional Services'."
      );
      return;
    }

    // 2. Call Backend to Save Choice
    setLoading(true);
    try {
      const response = await authApi.updateMode(selectedRole);

      if (response.success) {
        // A. Update Local Storage so the Dashboard Switcher knows what to do
        const currentUser = JSON.parse(localStorage.getItem("user"));
        currentUser.tax_mode = selectedRole;
        localStorage.setItem("user", JSON.stringify(currentUser));

        // B. Force Navigate to Dashboard (Reload ensures context updates)
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save your selection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-3xl mx-auto pt-32 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-brand mb-3">
            Let's set up your Tax Profile
          </h1>
          <p className="text-slate-500">
            To ensure KRA compliance, we need to know your primary source of
            income.
          </p>
        </div>

        {/* --- THE SELECTION CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Option 1: TRADER */}
          <Card
            selected={selectedRole === "TRADER"}
            onClick={() => setSelectedRole("TRADER")}
          >
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Store className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="font-bold text-brand text-lg mb-2">I Sell Goods</h3>
            <p className="text-sm text-slate-500">
              Shopkeepers, Hardware, Jua Kali, Retail. <br />
              <span className="text-blue-600 font-medium">
                Qualifies for 3% Turnover Tax.
              </span>
            </p>
          </Card>

          {/* Option 2: PROFESSIONAL */}
          <Card
            selected={selectedRole === "PROFESSIONAL"}
            onClick={() => setSelectedRole("PROFESSIONAL")}
          >
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="text-purple-600 w-6 h-6" />
            </div>
            <h3 className="font-bold text-brand text-lg mb-2">
              I Offer Services
            </h3>
            <p className="text-sm text-slate-500">
              Consultants, Doctors, Engineers, Designers. <br />
              <span className="text-purple-600 font-medium">
                Must file Income Tax (IT1).
              </span>
            </p>
          </Card>
        </div>

        {/* --- SPECIFIC PROFESSION INPUT --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            What is your specific Job Title?
          </label>
          <input
            type="text"
            placeholder="e.g. Graphic Designer, Dentist, Shop Owner"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-action focus:border-transparent outline-none transition-all"
            value={profession}
            onChange={(e) => {
              setProfession(e.target.value);
              setError(""); // Clear error when typing
            }}
          />
          <p className="text-xs text-slate-400 mt-2">
            We use this to verify your eligibility for tax simplified schemes.
          </p>
        </div>

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* --- CONTINUE BUTTON --- */}
        <button
          onClick={handleContinue}
          disabled={loading} // Disable button while processing
          className="w-full bg-brand hover:bg-brand-light text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              Continue to Dashboard
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Triage;
