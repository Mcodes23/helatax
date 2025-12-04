import { useState } from "react";
import {
  User,
  Mail,
  Hash,
  Briefcase,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import Navbar from "../../components/layout/Navbar";

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const currentMode = user?.tax_mode || "TRADER";
  // If current is Trader, target is Professional, and vice versa
  const targetMode = currentMode === "TRADER" ? "PROFESSIONAL" : "TRADER";

  const handleSwitchMode = async () => {
    // 1. Safety Check
    if (
      !window.confirm(
        `Are you sure you want to switch to ${targetMode} mode? This will change how your taxes are calculated.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // 2. Call API
      const response = await authApi.updateMode(targetMode);

      if (response.success) {
        // 3. Update Local Storage & Reload to reflect changes immediately
        // We merge the old user data with the new mode from the backend
        const updatedUser = {
          ...user,
          tax_mode: targetMode,
          has_confirmed_details: true,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.location.reload(); // Force refresh to update the Dashboard context
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-brand mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Personal Details */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" /> Personal Details
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Full Name
                </label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 font-medium">
                  {user?.name}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
                    {user?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> KRA PIN
                  </label>
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-600 font-mono">
                    {user?.kra_pin}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Profession
                </label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
                  {user?.profession}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tax Mode Switcher */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-fit">
            <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-400" /> Compliance Mode
            </h3>

            <div
              className={`p-4 rounded-xl mb-6 border ${
                currentMode === "TRADER"
                  ? "bg-blue-50 border-blue-100 text-blue-700"
                  : "bg-purple-50 border-purple-100 text-purple-700"
              }`}
            >
              <p className="text-xs font-bold uppercase opacity-70">
                Current Regime
              </p>
              <p className="text-xl font-bold capitalize">{currentMode}</p>
            </div>

            <button
              onClick={handleSwitchMode}
              disabled={loading}
              className="w-full py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Switch to {targetMode}
            </button>
            <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
              Changing this will affect your tax calculation logic immediately.
              Only switch if your business model has changed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
