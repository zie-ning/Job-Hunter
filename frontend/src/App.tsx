import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./routes/LoginPage";
import { SignupPage } from "./routes/SignupPage";
import { MatchesPage } from "./routes/MatchesPage";
import { BranchesPage } from "./routes/BranchesPage";
import { BranchDetailPage } from "./routes/BranchDetailPage";
import { BranchVersionDetailPage } from "./routes/BranchVersionDetailPage";
import { CalendarPage } from "./routes/CalendarPage";

// 동적 import + React.lazy — import.meta.env.DEV 체크만으로는 정적
// import가 프로덕션 번들에 그대로 포함된다. lazy로 감싸야 코드 스플리팅되어
// 실제로 번들 밖으로 빠진다 (아래에서 DEV일 때만 이 청크를 사용한다)
const DesignPlaygroundPage = lazy(() =>
  import("./routes/DesignPlaygroundPage").then((m) => ({
    default: m.DesignPlaygroundPage,
  })),
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {import.meta.env.DEV && (
        <Route
          path="/design"
          element={
            <Suspense fallback={null}>
              <DesignPlaygroundPage />
            </Suspense>
          }
        />
      )}
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
