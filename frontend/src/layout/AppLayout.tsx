import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Header } from "../components/Header";

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    // 새로고침 시 refresh 쿠키로 자동 로그인 여부를 확인하는 중.
    // 여기서 성급하게 /login으로 보내면 로그인된 사용자도 깜빡이며 튕겨나간다.
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
