// Access token은 어디에도 영속 저장하지 않고 이 모듈 스코프 변수에만 보관한다.
// XSS가 발생해도 새로고침 한 번이면 사라지는 값이라 탈취 시 피해 범위가 제한된다.
let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}
