import { Routes, Route, Navigate } from "react-router-dom";
import TodayPage from "./pages/TodayPage";
import PlanPage from "./pages/PlanPage";
import ProgressPage from "./pages/ProgressPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex justify-center">
      <div className="w-full max-w-md relative pb-28">
        <ProtectedRoute>
          <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Routes>
          </AppShell>
          <BottomNav />
        </ProtectedRoute>
      </div>
    </div>
  );
}