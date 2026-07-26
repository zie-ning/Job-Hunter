import httpx
import respx

KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me"


def _kakao_profile_response(kakao_id: int, nickname: str) -> httpx.Response:
    return httpx.Response(
        200,
        json={
            "id": kakao_id,
            "kakao_account": {
                "profile": {
                    "nickname": nickname,
                    "profile_image_url": "https://img.example.com/profile.png",
                },
            },
        },
    )


def _mock_kakao(kakao_id: int = 111, nickname: str = "테스트유저"):
    respx.post(KAKAO_TOKEN_URL).mock(
        return_value=httpx.Response(200, json={"access_token": "kakao-access-token"})
    )
    return respx.get(KAKAO_USER_INFO_URL).mock(
        return_value=_kakao_profile_response(kakao_id, nickname)
    )


@respx.mock
async def test_kakao_login_creates_new_user_and_sets_refresh_cookie(client):
    _mock_kakao(kakao_id=111, nickname="테스트유저")

    resp = await client.post("/auth/kakao/callback", json={"code": "dummy-code"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["user"]["kakao_id"] == 111
    assert body["user"]["nickname"] == "테스트유저"
    assert body["access_token"]
    assert resp.cookies.get("refresh_token") is not None


@respx.mock
async def test_kakao_login_upserts_profile_for_existing_kakao_id(client):
    route = _mock_kakao(kakao_id=222, nickname="닉네임1")

    first = await client.post("/auth/kakao/callback", json={"code": "code-1"})
    first_user_id = first.json()["user"]["id"]

    route.mock(return_value=_kakao_profile_response(222, "닉네임2"))
    second = await client.post("/auth/kakao/callback", json={"code": "code-2"})
    second_body = second.json()

    # 동일 kakao_id는 같은 계정으로 취급되고, 최신 프로필로 갱신된다.
    assert second_body["user"]["id"] == first_user_id
    assert second_body["user"]["nickname"] == "닉네임2"


@respx.mock
async def test_refresh_rotates_access_and_refresh_token(client):
    _mock_kakao(kakao_id=333)
    login = await client.post("/auth/kakao/callback", json={"code": "dummy-code"})
    old_refresh_token = login.cookies.get("refresh_token")

    refreshed = await client.post("/auth/refresh")

    assert refreshed.status_code == 200
    body = refreshed.json()
    assert body["access_token"]
    assert body["user"]["kakao_id"] == 333
    # Refresh token은 매 회전마다 새 값으로 교체되어야 한다(재사용 탐지의 전제 조건).
    new_refresh_token = refreshed.cookies.get("refresh_token")
    assert new_refresh_token is not None
    assert new_refresh_token != old_refresh_token


@respx.mock
async def test_reusing_rotated_refresh_token_revokes_all_active_tokens(client):
    _mock_kakao(kakao_id=444)
    login = await client.post("/auth/kakao/callback", json={"code": "dummy-code"})
    stolen_refresh_token = login.cookies.get("refresh_token")

    # 정상 흐름: 로그인 직후 발급된 토큰으로 정상 회전 (jar에는 새 refresh token이 저장된다)
    first_refresh = await client.post("/auth/refresh")
    assert first_refresh.status_code == 200

    # 공격 시나리오: 이미 폐기된(rotate로 무효화된) 최초 refresh token을 재사용
    replay = await client.post("/auth/refresh", cookies={"refresh_token": stolen_refresh_token})
    assert replay.status_code == 401

    # 재사용이 탐지되면 해당 유저의 모든 활성 토큰(방금 정상 발급된 것 포함)이 즉시 폐기되어야 한다
    latest_refresh_token = first_refresh.cookies.get("refresh_token")
    retry_with_latest = await client.post(
        "/auth/refresh", cookies={"refresh_token": latest_refresh_token}
    )
    assert retry_with_latest.status_code == 401


@respx.mock
async def test_logout_revokes_refresh_token(client):
    _mock_kakao(kakao_id=555)
    login = await client.post("/auth/kakao/callback", json={"code": "dummy-code"})
    refresh_token = login.cookies.get("refresh_token")

    logout = await client.post("/auth/logout")
    assert logout.status_code == 204

    # 로그아웃 후에는 클라이언트가 쿠키를 지웠더라도, 서버에 남아있던 refresh token 자체가 무효화되어 있어야 한다.
    reuse_after_logout = await client.post("/auth/refresh", cookies={"refresh_token": refresh_token})
    assert reuse_after_logout.status_code == 401


@respx.mock
async def test_me_requires_valid_access_token(client):
    unauthenticated = await client.get("/auth/me")
    assert unauthenticated.status_code == 401

    _mock_kakao(kakao_id=666, nickname="보호라우트테스트")
    login = await client.post("/auth/kakao/callback", json={"code": "dummy-code"})
    access_token = login.json()["access_token"]

    authenticated = await client.get(
        "/auth/me", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert authenticated.status_code == 200
    assert authenticated.json()["kakao_id"] == 666
