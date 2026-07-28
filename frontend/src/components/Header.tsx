import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";
import logoUrl from "../assets/logo.svg";

const NAV_ITEMS = [
  { to: "/branches", label: "브랜치" },
  { to: "/matches", label: "매칭 공고" },
  { to: "/calendar", label: "공고 달력" },
];

export function Header() {
  const { logout } = useAuth();
  return (
    <header className="app-header">
      <NavLink to="/branches" className="app-header-logo">
        <img src={logoUrl} alt="Job Hunter" className="app-header-logo-img" />
      </NavLink>
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
