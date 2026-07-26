import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./routes/LoginPage";
import { SignupPage } from "./routes/SignupPage";
import { ResumePage } from "./routes/ResumePage";
import { ResumeVersionDetailPage } from "./routes/ResumeVersionDetailPage";
import { MatchesPage } from "./routes/MatchesPage";
import { BranchesPage } from "./routes/BranchesPage";
import { BranchDetailPage } from "./routes/BranchDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route path="/resumes" element={<ResumePage />} />
        <Route
          path="/resumes/versions/:id"
          element={<ResumeVersionDetailPage />}
        />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/branches/:id" element={<BranchDetailPage />} />
        <Route index element={<Navigate to="/matches" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/matches" replace />} />
    </Routes>
  );
}

export default App;
