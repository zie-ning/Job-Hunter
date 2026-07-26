from collections.abc import AsyncGenerator

import httpx
import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  Base.metadata에 User/RefreshToken을 등록하기 위한 import
from app.db.session import Base, get_db
from app.main import app as fastapi_app


@pytest.fixture
async def client() -> AsyncGenerator[httpx.AsyncClient, None]:
    # SQLite 인메모리 DB. sqlalchemy.Uuid 타입 채택 덕분에 Postgres 전용 타입 없이도 동작한다.
    # 인메모리 DB는 연결마다 별개이므로 StaticPool로 단일 연결을 공유해야 테스트 중 데이터가 유지된다.
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db() -> AsyncGenerator:
        async with session_factory() as session:
            yield session

    fastapi_app.dependency_overrides[get_db] = override_get_db

    transport = httpx.ASGITransport(app=fastapi_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    fastapi_app.dependency_overrides.clear()
    await engine.dispose()
