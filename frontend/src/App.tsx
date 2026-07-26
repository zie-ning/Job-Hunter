import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { Card } from "./components/Card";
import { EmptyState } from "./components/EmptyState";
import { LoginPage } from "./routes/LoginPage";
import { SignupPage } from "./routes/SignupPage";
import { ResumePage } from "./routes/ResumePage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card>
      <EmptyState
        title={title}
        description="이 화면은 다음 작업에서 구현됩니다."
      />
    </Card>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route path="/resumes" element={<ResumePage />} />
        <Route
          path="/resumes/versions/:id"
          element={<PlaceholderPage title="버전 상세" />}
        />
        <Route path="/matches" element={<PlaceholderPage title="JD 매칭" />} />
        <Route
          path="/branches"
          element={<PlaceholderPage title="브랜치 목록" />}
        />
        <Route
          path="/branches/:id"
          element={<PlaceholderPage title="브랜치 상세" />}
        />
        <Route index element={<Navigate to="/matches" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/matches" replace />} />
    </Routes>
  );
}

export default App;
