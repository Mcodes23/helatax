import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 1. Public Pages
import Landing from "./pages/public/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// 2. Onboarding (The Gatekeeper)
import Triage from "./pages/onboarding/Triage";

// 3. Dashboard Pages
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import TraderHome from "./pages/dashboard/TraderHome";
import ProHome from "./pages/dashboard/ProHome";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// 4. Filing Wizard Pages
import Step1_Upload from "./pages/filing/Step1_Upload";
import Step2_Review from "./pages/filing/Step2_Review";
import Step3_Payment from "./pages/filing/Step3_Payment";
import Step4_Download from "./pages/filing/Step4_Download";

import AiAdvisor from "./pages/dashboard/AiAdvisor";
import History from "./pages/reports/History";

// --- HELPER COMPONENT: The Dashboard Switcher ---
const DashboardSwitcher = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.tax_mode === "TRADER") return <TraderHome />;
  if (user.tax_mode === "PROFESSIONAL") return <ProHome />;

  return <Navigate to="/onboarding" replace />;
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- PROTECTED ROUTES --- */}

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Triage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard & Filing Layout (Sidebar + Header) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard Home */}
          <Route path="dashboard" element={<DashboardSwitcher />} />

          {/* Filing Wizard Routes (Nested under Layout) */}
          {/* Filing Wizard Routes */}
          <Route path="/filing">
            <Route
              index
              element={
                <ProtectedRoute>
                  <Step1_Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="review"
              element={
                <ProtectedRoute>
                  <Step2_Review />
                </ProtectedRoute>
              }
            />
            <Route
              path="payment"
              element={
                <ProtectedRoute>
                  <Step3_Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="download"
              element={
                <ProtectedRoute>
                  <Step4_Download />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/history" element={<History />} />
          <Route path="/ai-chat" element={<AiAdvisor />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
