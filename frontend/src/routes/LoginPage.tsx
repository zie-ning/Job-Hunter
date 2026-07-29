import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoSymbol } from "../components/Header";
import { KakaoIcon } from "../components/icons";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleKakaoLogin() {
    setIsSubmitting(true);
    try {
      // 카카오 소셜 로그인 mock 액션 실행 후 브랜치 화면으로 이동
      await login("kakao_user@jobhunter.dev", "kakao-auth-token");
      navigate("/branches");
    } catch {
      // 로그인 오류 발생 시 조치
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-bg relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-16">
      {/* 배경 하단 보라색 그라데이션 앰비언트 글로우 레이어 (UI 레퍼런스) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60vh] opacity-80 transition-opacity duration-500 dark:opacity-40"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 100%, rgb(107 92 231 / 28%) 0%, rgb(169 155 255 / 15%) 40%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-(--container-auth) flex-col items-center text-center">
        {/* 서비스 로고 */}
        <div className="text-accent flex items-center gap-3.5">
          <LogoSymbol size={40} className="shrink-0" />
          <span className="font-display text-text-strong text-4xl font-bold tracking-tight">
            Job Hunter
          </span>
        </div>

        {/* 카카오 소셜 로그인 전용 버튼 (카드 없이 배경 위 직접 배치) */}
        <div className="mt-20 w-full max-w-[320px]">
          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-(--radius-sm) bg-[#FEE500] px-4 py-3.5 font-sans text-sm font-semibold text-[#191919] shadow-sm transition-all duration-150 hover:bg-[#fada0a] active:scale-[0.99] disabled:opacity-60"
          >
            <KakaoIcon size={20} className="fill-[#191919]" />
            <span>카카오 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
}
