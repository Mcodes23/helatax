import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { authApi } from "../../api/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Added error state
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Call Backend API
      // The API returns: { success: true, data: { token: "...", name: "...", ... } }
      const response = await authApi.login(formData);
      console.log("Login Raw Response:", response);

      if (response.success) {
        // 2. Extract Data Correctly (FIXED HERE)
        const userData = response.data;
        const token = userData.token;

        // 3. Save Token & User
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // 4. Redirect to Dashboard
        navigate("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-brand">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-2">
              Enter your credentials to access your tax portal.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
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
                  className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-action focus:border-transparent outline-none transition-all"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-action hover:text-green-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="pl-10 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-action focus:border-transparent outline-none transition-all"
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
              className="w-full bg-brand hover:bg-brand-light text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="animate-spin w-5 h-5" />
              ) : (
                "Sign In"
              )}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-action font-semibold hover:text-green-700"
            >
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
