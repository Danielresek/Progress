import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import TodayPage from "./pages/TodayPage";
import PlanPage from "./pages/PlanPage";
import ProgressPage from "./pages/ProgressPage";
import PlanDayPage from "./pages/PlanDayPage";
import TodayRunPage from "./pages/TodayRunPage";
import CallbackPage from "./pages/CallbackPage";

import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";

// Layout som kun brukes når man er innlogget
function AuthedLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth0();

  // Skjul nav på disse routene
  const hideNavForPath =
    location.pathname.startsWith("/callback") ||
    location.pathname.startsWith("/today/run");

  const showNav = !isLoading && isAuthenticated && !hideNavForPath;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex justify-center">
      <div className="w-full max-w-md relative">
        <AppShell>
          <Outlet />
        </AppShell>

        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Offentlige routes */}
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/" element={<Navigate to="/today" replace />} />

      {/* Alt under her krever innlogging */}
      <Route
        element={
          <ProtectedRoute>
            <AuthedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/today" element={<TodayPage />} />
        <Route path="/today/run/:dayId" element={<TodayRunPage />} />

        <Route path="/plan" element={<PlanPage />} />
        <Route path="/plan/day/:dayId" element={<PlanDayPage />} />

        <Route path="/progress" element={<ProgressPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  );
}