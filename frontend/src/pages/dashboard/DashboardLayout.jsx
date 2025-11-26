import { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Clock,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand text-white transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 shadow-xl flex flex-col`}
      >
        {/* Logo Area - FIXED ALIGNMENT */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-brand-light shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-action" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-action transition-colors">
              HelaTax
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto py-6">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Menu
          </p>

          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/dashboard")
                ? "bg-action text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </Link>

          <Link
            to="/filing"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/filing")
                ? "bg-action text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>File Returns</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/history")
                ? "bg-action text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>History</span>
          </Link>

          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">
            Support
          </p>

          <Link
            to="/ai-chat"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/ai-chat")
                ? "bg-action text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span>AI Advisor</span>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 text-xs text-center text-slate-600 border-t border-slate-800">
          v1.0.0 &copy; 2025
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-slate-500 hover:text-brand"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2.5 w-64 border border-transparent focus-within:border-brand/20 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search returns..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-brand hover:bg-slate-50 rounded-full transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 focus:outline-none group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-brand transition-colors">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium capitalize">
                    {user?.tax_mode?.toLowerCase() || "Loading..."}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center font-bold border-2 border-slate-100 group-hover:border-action transition-all">
                  {user?.name ? user.name[0] : "U"}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        Account
                      </p>
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
