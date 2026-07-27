import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";

const NAV_ITEMS = [
  { to: "/resumes", label: "이력서 관리" },
  { to: "/matches", label: "JD 매칭" },
  { to: "/branches", label: "브랜치" },
];

export function Header() {
  const { logout } = useAuth();
  return (
    <header className="app-header">
      <span className="app-header-logo">채용지원 어시스턴트</span>
      <nav className="app-header-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "app-header-link active" : "app-header-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Button variant="ghost" onClick={logout}>
        로그아웃
      </Button>
    </header>
  );
}
