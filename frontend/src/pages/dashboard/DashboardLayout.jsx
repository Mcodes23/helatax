import { useState, useEffect } from "react";
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
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/axiosConfig"; // <--- Import API Client

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // --- POLLING EFFECT ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get("/notifications");
        if (response.data.success) {
          setNotifications(response.data.data);
        }
      } catch (error) {
        console.error("Notification fetch error", error);
      }
    };

    fetchNotifications(); // Fetch immediately
    const interval = setInterval(fetchNotifications, 30000); // Then every 30s

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      // Update local state to remove the "unread" status visually
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Helper for Icons
  const getNotifIcon = (type) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand text-white transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 shadow-xl flex flex-col`}
      >
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
              isActive("/filing") || location.pathname.includes("/filing")
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

        <div className="p-4 text-xs text-center text-slate-600 border-t border-slate-800">
          v1.0.0 &copy; 2025
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
            {/* --- NOTIFICATION BELL --- */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-slate-400 hover:text-brand hover:bg-slate-50 rounded-full transition-all"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Notifications
                      </p>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-sm text-slate-400">
                            No new alerts
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleMarkAsRead(n._id)}
                            className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                              !n.isRead ? "bg-blue-50/40" : ""
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="mt-1">{getNotifIcon(n.type)}</div>
                              <div>
                                <p
                                  className={`text-sm ${
                                    !n.isRead
                                      ? "font-semibold text-slate-800"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {n.message}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* --- PROFILE MENU --- */}
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
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20">
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
