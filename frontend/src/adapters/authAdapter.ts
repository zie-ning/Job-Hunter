import { apiFetch } from "../lib/api";
import { setAccessToken } from "../lib/authToken";

export interface AuthUser {
  id: string;
  kakaoId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface AuthAdapter {
  getKakaoAuthorizeUrl(): string;
  handleKakaoCallback(code: string): Promise<AuthUser>;
  refreshSession(): Promise<AuthUser | null>;
  logout(): Promise<void>;
}

interface TokenResponseDto {
  access_token: string;
  user: {
    id: string;
    kakao_id: number;
    nickname: string;
    profile_image_url: string | null;
  };
}

function toAuthUser(user: TokenResponseDto["user"]): AuthUser {
  return {
    id: user.id,
    kakaoId: user.kakao_id,
    nickname: user.nickname,
    profileImageUrl: user.profile_image_url,
  };
}

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID ?? "";
const KAKAO_REDIRECT_URI =
  import.meta.env.VITE_KAKAO_REDIRECT_URI ??
  `${window.location.origin}/auth/kakao/callback`;

export const kakaoAuthAdapter: AuthAdapter = {
  getKakaoAuthorizeUrl() {
    const params = new URLSearchParams({
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      response_type: "code",
      scope: "profile_nickname",
    });
    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  },

  async handleKakaoCallback(code) {
    const data = await apiFetch<TokenResponseDto>("/auth/kakao/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    setAccessToken(data.access_token);
    return toAuthUser(data.user);
  },

  async refreshSession() {
    try {
      const data = await apiFetch<TokenResponseDto>("/auth/refresh", {
        method: "POST",
      });
      setAccessToken(data.access_token);
      return toAuthUser(data.user);
    } catch {
      // 쿠키가 없거나 만료된 정상적인 비로그인 상태 — 에러로 취급하지 않는다.
      return null;
    }
  },

  async logout() {
    try {
      await apiFetch<void>("/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
    }
  },
};
