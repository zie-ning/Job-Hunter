import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";

const NAV_ITEMS = [
  { to: "/branches", label: "브랜치" },
  { to: "/matches", label: "매칭 공고" },
  { to: "/calendar", label: "공고 달력" },
];

/**
 * 심볼만 인라인 SVG로 그린다. 예전에는 워드마크까지 SVG <text>에
 * system-ui로 그려 넣어 OS마다 로고 모양이 달라졌다 — 워드마크는
 * 아래 Header에서 실제 self-hosted 폰트로 렌더링해 이 문제를 없앤다.
 * currentColor를 써서 색이 부모 텍스트 색(테마 전환)을 그대로 따른다.
 */
function LogoSymbol() {
  return (
    <svg
      viewBox="0 0 80 80"
      width="26"
      height="26"
      className="app-header-logo-symbol"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      >
        <circle cx="40" cy="40" r="19" />
        <line x1="40" y1="4" x2="40" y2="16" />
        <line x1="40" y1="76" x2="40" y2="64" />
        <line x1="4" y1="40" x2="16" y2="40" />
        <line x1="76" y1="40" x2="64" y2="40" />
      </g>
      <circle cx="40" cy="40" r="8" fill="currentColor" />
    </svg>
  );
}

export function Header() {
  const { logout } = useAuth();
  return (
    <header className="app-header">
      <NavLink to="/branches" className="app-header-logo">
        <LogoSymbol />
        <span className="app-header-logo-word">Job Hunter</span>
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
      <Button
        variant="ghost"
        className="shrink-0 whitespace-nowrap"
        onClick={logout}
      >
        로그아웃
      </Button>
    </header>
  );
}
