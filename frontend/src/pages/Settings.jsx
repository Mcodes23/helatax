import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { User, Lock, Bell, Shield, Save } from "lucide-react";

const Settings = () => {
  // Mock User Data
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {
      name: "User",
      email: "user@example.com",
      businessType: "Individual",
    }
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Account Settings
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 1. SIDEBAR NAVIGATION (Visual Only) */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button className="w-full flex items-center gap-3 px-6 py-4 bg-green-50 text-green-700 border-l-4 border-green-600 font-medium">
                <User size={20} /> Profile Details
              </button>
              <button className="w-full flex items-center gap-3 px-6 py-4 text-slate-600 hover:bg-slate-50 transition font-medium">
                <Lock size={20} /> Security
              </button>
              <button className="w-full flex items-center gap-3 px-6 py-4 text-slate-600 hover:bg-slate-50 transition font-medium">
                <Bell size={20} /> Notifications
              </button>
              <button className="w-full flex items-center gap-3 px-6 py-4 text-slate-600 hover:bg-slate-50 transition font-medium">
                <Shield size={20} /> Privacy
              </button>
            </div>
          </div>

          {/* 2. MAIN FORM AREA */}
          <div className="col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                Edit Profile
              </h3>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-slate-50"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Email cannot be changed.
                  </p>
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Type
                  </label>
                  <select
                    defaultValue={user.businessType}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-slate-50"
                  >
                    <option value="Individual">Individual (Employee)</option>
                    <option value="Small Business">Small Business</option>
                    <option value="Freelancer">Freelancer</option>
                  </select>
                </div>

                {/* KRA PIN (New Mock Field) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    KRA PIN
                  </label>
                  <input
                    type="text"
                    placeholder="A000..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-slate-50 uppercase"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
