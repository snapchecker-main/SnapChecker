from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from app.config import settings


def create_token(
    user_id: int,
    email: str,
    token_type: str = "access",
) -> str:
    """
    Create an access, refresh, verify_email, or reset_password token.
    """
    if token_type == "access":
        expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    elif token_type == "refresh":
        expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    elif token_type == "verify_email":
        expires = timedelta(hours=24) # 🚨 ADDED: 24 hours to verify
    elif token_type == "reset_password":
        expires = timedelta(minutes=15) # 🚨 ADDED: 15 minutes to reset
    else:
        raise ValueError("Invalid token type.")

    payload = {
        "sub": str(user_id),
        "email": email,
        "type": token_type,
        "exp": datetime.now(timezone.utc) + expires,
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT.
    """

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload

    except ExpiredSignatureError:
        raise ValueError("Token has expired.")

    except InvalidTokenError:
        raise ValueError("Invalid token.")