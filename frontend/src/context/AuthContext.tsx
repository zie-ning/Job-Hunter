import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { kakaoAuthAdapter, type AuthUser } from "../adapters/authAdapter";
import { setUnauthorizedHandler } from "../lib/authToken";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  loginWithKakao: () => void;
  handleKakaoCallback: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 새로고침 시 httpOnly refresh 쿠키로 조용히 자동 로그인을 시도한다.
    kakaoAuthAdapter.refreshSession().then((sessionUser) => {
      setUser(sessionUser);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    // API 클라이언트가 401을 만나 refresh까지 실패하면 로그인 상태를 정리한다.
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  function loginWithKakao() {
    window.location.href = kakaoAuthAdapter.getKakaoAuthorizeUrl();
  }

  async function handleKakaoCallback(code: string) {
    const sessionUser = await kakaoAuthAdapter.handleKakaoCallback(code);
    setUser(sessionUser);
  }

  async function logout() {
    await kakaoAuthAdapter.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        isLoading,
        user,
        loginWithKakao,
        handleKakaoCallback,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
