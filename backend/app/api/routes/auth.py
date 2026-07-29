from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import KakaoCallbackRequest, TokenResponse, UserRead
from app.services import kakao
from app.services.auth_tokens import issue_refresh_token, revoke_refresh_token, rotate_refresh_token
from app.services.users import upsert_kakao_user

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

REFRESH_TOKEN_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, raw_refresh_token: str) -> None:
    is_prod = settings.environment == "production"
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=raw_refresh_token,
        httponly=True,
        secure=is_prod,
        # 배포 시 프론트/백엔드가 서로 다른 도메인이라 SameSite=None이 필요하지만,
        # 로컬 개발(http://localhost)은 Secure 쿠키를 브라우저가 저장하지 않으므로 Lax로 완화한다.
        samesite="none" if is_prod else "lax",
        path="/auth",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE, path="/auth")


@router.post("/kakao/callback", response_model=TokenResponse)
async def kakao_callback(
    body: KakaoCallbackRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    try:
        kakao_access_token = await kakao.exchange_code_for_token(body.code)
        profile = await kakao.fetch_kakao_profile(kakao_access_token)
    except kakao.KakaoAuthError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    user = await upsert_kakao_user(
        db,
        kakao_id=profile["kakao_id"],
        nickname=profile["nickname"],
        profile_image_url=profile["profile_image_url"],
    )

    access_token = create_access_token(user.id)
    raw_refresh_token = await issue_refresh_token(db, user.id)
    _set_refresh_cookie(response, raw_refresh_token)

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserRead.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    response: Response,
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_TOKEN_COOKIE)] = None,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    result = await rotate_refresh_token(db, refresh_token)
    if result is None:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_raw_refresh, new_access_token, user = result
    _set_refresh_cookie(response, new_raw_refresh)

    return TokenResponse(
        access_token=new_access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserRead.model_validate(user),
    )


@router.post("/logout", status_code=204)
async def logout(
    response: Response,
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_TOKEN_COOKIE)] = None,
    db: AsyncSession = Depends(get_db),
) -> None:
    if refresh_token is not None:
        await revoke_refresh_token(db, refresh_token)
    _clear_refresh_cookie(response)


@router.get("/me", response_model=UserRead)
async def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserRead:
    return UserRead.model_validate(current_user)
