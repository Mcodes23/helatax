import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Landing from "./pages/public/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Triage from "./pages/onboarding/Triage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import TraderHome from "./pages/dashboard/TraderHome";
import ProHome from "./pages/dashboard/ProHome";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Step1_Upload from "./pages/filing/Step1_Upload";
import Step2_Review from "./pages/filing/Step2_Review";
import Step3_TemplateUpload from "./pages/filing/Step3_TemplateUpload";
import Step3_Payment from "./pages/filing/Step3_Payment";
import Step4_Download from "./pages/filing/Step4_Download";
import AiAdvisor from "./pages/dashboard/AiAdvisor";
import History from "./pages/reports/History";
import Settings from "./pages/dashboard/Settings";

const DashboardSwitcher = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.has_confirmed_details === false) {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.tax_mode === "TRADER") return <TraderHome />;
  if (user.tax_mode === "PROFESSIONAL") return <ProHome />;

  return <Navigate to="/onboarding" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Triage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardSwitcher />} />
          <Route path="profile" element={<Settings />} />{" "}
          {/* <--- 2. ADD ROUTE HERE */}
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
              path="template-upload"
              element={
                <ProtectedRoute>
                  <Step3_TemplateUpload />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
