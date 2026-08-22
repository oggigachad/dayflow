from collections import defaultdict
from datetime import datetime, timezone
import time
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
import jwt

from app.models import Profile, Role, SalaryStructure, User
from app.schemas import LoginIn, RefreshIn, SignupIn, TokenPair
from app.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.services.audit_service import record_audit

# Simple in-memory sliding window rate limiter for login protection
_LOGIN_ATTEMPTS: dict[str, list[float]] = defaultdict(list)
_MAX_ATTEMPTS = 10
_WINDOW_SECONDS = 60


def check_login_rate_limit(ip_or_email: str) -> None:
    now = time.time()
    attempts = _LOGIN_ATTEMPTS[ip_or_email]
    # filter attempts in window
    _LOGIN_ATTEMPTS[ip_or_email] = [t for t in attempts if now - t < _WINDOW_SECONDS]
    if len(_LOGIN_ATTEMPTS[ip_or_email]) >= _MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )
    _LOGIN_ATTEMPTS[ip_or_email].append(now)


def generate_tokens_for_user(user: User) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id, user.role.value),
    )


def register_user(db: Session, payload: SignupIn) -> TokenPair:
    user = User(
        employee_id=payload.employee_id,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_verified=True,
    )
    user.profile = Profile(full_name=payload.full_name)
    user.salary = SalaryStructure(base_salary=0, allowances={}, deductions={})

    db.add(user)
    try:
        db.flush()
        record_audit(
            db,
            actor_id=user.id,
            action="auth.signup",
            target_table="users",
            target_id=user.id,
            metadata={"email": user.email, "role": user.role.value},
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email or employee ID already exists",
        )
    db.refresh(user)
    return generate_tokens_for_user(user)


def authenticate_user(db: Session, payload: LoginIn, client_ip: str = "unknown") -> TokenPair:
    check_login_rate_limit(payload.email.lower())

    user = db.query(User).filter(User.email == payload.email.lower()).one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
        )

    record_audit(
        db,
        actor_id=user.id,
        action="auth.login",
        target_table="users",
        target_id=user.id,
        metadata={"client_ip": client_ip, "timestamp": datetime.now(timezone.utc).isoformat()},
    )
    db.commit()
    return generate_tokens_for_user(user)


def refresh_user_token(db: Session, payload: RefreshIn) -> TokenPair:
    try:
        claims = decode_token(payload.refresh_token, "refresh")
        user = db.get(User, int(claims["sub"]))
    except (jwt.InvalidTokenError, KeyError, ValueError):
        user = None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    return generate_tokens_for_user(user)
