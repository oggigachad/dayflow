"""Password hashing and JWT issue/verify.

Access and refresh tokens carry a `type` claim so one can never be swapped for
the other: a stolen access token cannot be replayed at /auth/refresh to mint a
fresh pair, and a refresh token cannot be used as a bearer credential.
"""

from datetime import datetime, timedelta, timezone
from typing import Literal

import bcrypt
import jwt

from app.config import settings

TokenType = Literal["access", "refresh"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        # Malformed hash in the DB — treat as a failed login, never a 500.
        return False


def _create_token(
    *, subject: int, role: str, token_type: TokenType, expires_in: timedelta
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "role": role,
        "type": token_type,
        "iat": now,
        "exp": now + expires_in,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: int, role: str) -> str:
    return _create_token(
        subject=user_id,
        role=role,
        token_type="access",
        expires_in=timedelta(minutes=settings.access_token_minutes),
    )


def create_refresh_token(user_id: int, role: str) -> str:
    return _create_token(
        subject=user_id,
        role=role,
        token_type="refresh",
        expires_in=timedelta(days=settings.refresh_token_days),
    )


def decode_token(token: str, expected_type: TokenType) -> dict:
    """Decode and validate a token. Raises jwt.InvalidTokenError on any problem."""
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(f"expected a {expected_type} token")
    return payload


if __name__ == "__main__":
    # Smallest runnable check that fails if the security logic breaks.
    h = hash_password("correct horse")
    assert verify_password("correct horse", h)
    assert not verify_password("wrong horse", h)
    assert not verify_password("correct horse", "not-a-bcrypt-hash")

    access = create_access_token(7, "admin")
    refresh = create_refresh_token(7, "admin")
    assert decode_token(access, "access")["sub"] == "7"
    assert decode_token(access, "access")["role"] == "admin"

    # The whole point of the type claim: neither token works as the other.
    for token, wrong_type in ((access, "refresh"), (refresh, "access")):
        try:
            decode_token(token, wrong_type)
            raise AssertionError(f"{wrong_type} check did not reject the wrong token type")
        except jwt.InvalidTokenError:
            pass

    print("security.py self-check passed")
