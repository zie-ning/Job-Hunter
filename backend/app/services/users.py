from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def upsert_kakao_user(
    db: AsyncSession,
    *,
    kakao_id: int,
    nickname: str,
    profile_image_url: str | None,
) -> User:
    result = await db.execute(select(User).where(User.kakao_id == kakao_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            kakao_id=kakao_id,
            nickname=nickname,
            profile_image_url=profile_image_url,
        )
        db.add(user)
    else:
        # 카카오 프로필이 바뀌었을 수 있으므로 매 로그인 시 최신값으로 동기화한다.
        user.nickname = nickname
        user.profile_image_url = profile_image_url

    await db.commit()
    await db.refresh(user)
    return user
