import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import create_access_token, generate_refresh_token, hash_token
from app.models.refresh_token import RefreshToken
from app.models.user import User

settings = get_settings()


def _as_aware_utc(value: datetime) -> datetime:
    # Postgres(TIMESTAMPTZ)는 tz-aware datetime을 반환하지만, 테스트에 쓰는 SQLite는
    # tz 정보를 저장하지 않고 naive datetime을 반환한다. 두 백엔드에서 동일하게 비교할 수 있도록 보정한다.
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


async def issue_refresh_token(db: AsyncSession, user_id: uuid.UUID) -> str:
    raw_token = generate_refresh_token()
    now = datetime.now(timezone.utc)
    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=hash_token(raw_token),
            expires_at=now + timedelta(days=settings.refresh_token_expire_days),
        )
    )
    await db.commit()
    return raw_token


async def rotate_refresh_token(db: AsyncSession, raw_token: str) -> tuple[str, str, User] | None:
    token_hash = hash_token(raw_token)
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    token_row = result.scalar_one_or_none()
    if token_row is None:
        return None

    now = datetime.now(timezone.utc)

    if token_row.revoked_at is not None:
        # 이미 폐기된 토큰으로 재요청이 들어옴 = 탈취 의심 → 해당 유저의 모든 활성 토큰을 즉시 폐기
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == token_row.user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await db.commit()
        return None

    if _as_aware_utc(token_row.expires_at) < now:
        return None

    user = await db.get(User, token_row.user_id)
    if user is None:
        return None

    token_row.revoked_at = now
    new_raw_refresh = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(new_raw_refresh),
            expires_at=now + timedelta(days=settings.refresh_token_expire_days),
        )
    )
    await db.commit()

    new_access_token = create_access_token(user.id)
    return new_raw_refresh, new_access_token, user


async def revoke_refresh_token(db: AsyncSession, raw_token: str) -> None:
    token_hash = hash_token(raw_token)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash, RefreshToken.revoked_at.is_(None))
    )
    token_row = result.scalar_one_or_none()
    if token_row is not None:
        token_row.revoked_at = datetime.now(timezone.utc)
        await db.commit()
