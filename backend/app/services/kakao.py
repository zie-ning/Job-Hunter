from typing import Any

import httpx

from app.core.config import get_settings

settings = get_settings()

KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me"


class KakaoAuthError(Exception):
    pass


async def exchange_code_for_token(code: str) -> str:
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.kakao_client_id,
        "redirect_uri": settings.kakao_redirect_uri,
        "code": code,
    }
    # client_secret은 카카오 콘솔에서 "Client Secret 사용"을 켠 경우에만
    # 존재하므로, 있을 때만 포함한다.
    if settings.kakao_client_secret:
        data["client_secret"] = settings.kakao_client_secret

    async with httpx.AsyncClient() as client:
        response = await client.post(KAKAO_TOKEN_URL, data=data)

    if response.status_code != 200:
        raise KakaoAuthError(f"카카오 토큰 교환 실패: {response.status_code} {response.text}")

    return response.json()["access_token"]


async def fetch_kakao_profile(kakao_access_token: str) -> dict[str, Any]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            KAKAO_USER_INFO_URL,
            headers={"Authorization": f"Bearer {kakao_access_token}"},
        )

    if response.status_code != 200:
        raise KakaoAuthError(f"카카오 프로필 조회 실패: {response.status_code} {response.text}")

    profile = response.json()
    kakao_account = profile.get("kakao_account", {})
    account_profile = kakao_account.get("profile", {})

    return {
        "kakao_id": profile["id"],
        "nickname": account_profile.get("nickname", ""),
        "profile_image_url": account_profile.get("profile_image_url"),
    }
