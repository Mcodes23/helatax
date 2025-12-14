import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Hash, Briefcase, Loader } from "lucide-react";
import { authApi } from "../../api/authApi"; 

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    kra_pin: "",
    profession: "",
    businessType: "TRADER", 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Call Backend API
      await authApi.register(formData);

     
      alert("Account created successfully! Please log in.");
      navigate("/login"); // <--- Flow Correction
    } catch (err) {
      console.error("Registration Error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-brand">
              Create your HelaTax Account
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Start your compliance journey today.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-action outline-none"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-action outline-none"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* KRA PIN */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                KRA PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-action outline-none uppercase"
                  placeholder="A00..."
                  maxLength={11}
                  value={formData.kra_pin}
                  onChange={(e) =>
                    setFormData({ ...formData, kra_pin: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Profession (Critical for Triage) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Primary Profession / Business
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-action outline-none"
                  placeholder="e.g. Doctor, Shopkeeper, Consultant"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                />
                <p className="text-xs text-slate-400 mt-1">
                  We use this to automatically determine if you pay Turnover Tax
                  (3%) or Income Tax.
                </p>
              </div>
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-action outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 w-full bg-brand hover:bg-brand-light text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin w-5 h-5" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-action font-semibold hover:text-green-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
