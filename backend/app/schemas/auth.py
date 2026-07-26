import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict


class KakaoCallbackRequest(BaseModel):
    code: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    kakao_id: int
    nickname: str
    profile_image_url: str | None


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: UserRead
