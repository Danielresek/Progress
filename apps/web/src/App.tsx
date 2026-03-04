import { Routes, Route, Navigate } from "react-router-dom";
import TodayPage from "./pages/TodayPage";
import PlanPage from "./pages/PlanPage";
import ProgressPage from "./pages/ProgressPage";
import PlanDayPage from "./pages/PlanDayPage";
import TodayRunPage from "./pages/TodayRunPage";
import CallbackPage from "./pages/CallbackPage";

import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";

import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function App() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth0();

  // Skjul nav på disse routene
  const hideNavForPath =
    location.pathname.startsWith("/callback") ||
    location.pathname.startsWith("/today/run");

  // ✅ Vis nav kun når:
  // - ikke loading
  // - innlogget
  // - ikke en route som skal være uten nav
  const showNav = !isLoading && isAuthenticated && !hideNavForPath;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex justify-center">
      <div className="w-full max-w-md relative pb-28">
        <AppShell>
          <Routes>
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/" element={<Navigate to="/today" replace />} />

            <Route path="/today" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
            <Route path="/today/run/:dayId" element={<ProtectedRoute><TodayRunPage /></ProtectedRoute>} />

            <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
            <Route path="/plan/day/:dayId" element={<ProtectedRoute><PlanDayPage /></ProtectedRoute>} />

            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
        </AppShell>

        {showNav && <BottomNav />}
      </div>
    </div>
  );
}