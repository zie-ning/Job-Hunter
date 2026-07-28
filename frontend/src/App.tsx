import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./routes/LoginPage";
import { SignupPage } from "./routes/SignupPage";
import { MatchesPage } from "./routes/MatchesPage";
import { BranchesPage } from "./routes/BranchesPage";
import { BranchDetailPage } from "./routes/BranchDetailPage";
import { BranchVersionDetailPage } from "./routes/BranchVersionDetailPage";
import { CalendarPage } from "./routes/CalendarPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/branches/:id" element={<BranchDetailPage />} />
        <Route
          path="/branches/:branchId/versions/:versionId"
          element={<BranchVersionDetailPage />}
        />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route index element={<Navigate to="/branches" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/branches" replace />} />
    </Routes>
  );
}

export default App;
