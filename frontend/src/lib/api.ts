import {
  getAccessToken,
  notifyUnauthorized,
  setAccessToken,
} from "./authToken";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// 이 경로들은 인증 흐름 자체를 다루는 엔드포인트라, 401을 "access token 만료"가
// 아니라 그 자체의 의미(코드 만료, refresh token 없음 등)로 취급해야 한다.
// 여기서 401이 나도 refresh를 다시 시도하면 안 된다(무한 루프 위험).
const AUTH_FLOW_PATHS = [
  "/auth/refresh",
  "/auth/kakao/callback",
  "/auth/logout",
];

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = (await res.json()) as { access_token: string };
        setAccessToken(data.access_token);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  _isRetry = false,
): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (res.status === 401 && !_isRetry && !AUTH_FLOW_PATHS.includes(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, init, true);
    }
    notifyUnauthorized();
  }

  if (!res.ok) {
    throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
