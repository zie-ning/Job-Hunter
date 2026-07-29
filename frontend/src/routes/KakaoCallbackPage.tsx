import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleKakaoCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // 카카오 인가 코드는 1회용이라, StrictMode의 effect 이중 실행으로
  // 같은 code를 두 번 교환 시도하면 두 번째 요청이 실패한다. ref로 막는다.
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const code = searchParams.get("code");
    if (!code) {
      setError("카카오 인가 코드가 없습니다.");
      return;
    }

    handleKakaoCallback(code)
      .then(() => navigate("/branches", { replace: true }))
      .catch(() =>
        setError("카카오 로그인에 실패했습니다. 다시 시도해주세요."),
      );
  }, [searchParams, handleKakaoCallback, navigate]);

  return (
    <div className="flex min-h-svh items-center justify-center px-5">
      <p className="text-text text-sm">
        {error ?? "카카오 로그인 처리 중입니다..."}
      </p>
    </div>
  );
}
