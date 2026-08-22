from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import jwt

from app.database import get_db
from app.deps import get_current_user
from app.models import Profile, Role, SalaryStructure, User
from app.schemas import LoginIn, RefreshIn, SignupIn, TokenPair, UserOut
from app.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _tokens_for(user: User) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id, user.role.value),
    )


@router.post("/signup", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupIn, db: Session = Depends(get_db)) -> TokenPair:
    user = User(
        employee_id=payload.employee_id,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        # TODO: real email verification. Stubbed true so the demo can log in
        # immediately; see request_verification below for where it plugs in.
        is_verified=True,
    )
    user.profile = Profile(full_name=payload.full_name)
    # Every employee gets a (zeroed) salary structure so /payroll/me is never a
    # 404 — the admin fills in the real numbers.
    user.salary = SalaryStructure(base_salary=0, allowances={}, deductions={})

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # The unique constraints are the real guard; this turns them into a
        # useful message instead of a 500.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email or employee ID already exists",
        )
    db.refresh(user)
    return _tokens_for(user)


@router.post("/login", response_model=TokenPair)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenPair:
    user = db.query(User).filter(User.email == payload.email.lower()).one_or_none()
    # Same error for "no such user" and "wrong password" — don't leak which
    # emails are registered.
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
        )
    return _tokens_for(user)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshIn, db: Session = Depends(get_db)) -> TokenPair:
    try:
        claims = decode_token(payload.refresh_token, "refresh")
        user = db.get(User, int(claims["sub"]))
    except (jwt.InvalidTokenError, KeyError, ValueError):
        user = None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    # Rotate both: the old refresh token's lifetime is not extended silently.
    return _tokens_for(user)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/request-verification", status_code=status.HTTP_202_ACCEPTED)
def request_verification(current_user: User = Depends(get_current_user)) -> dict:
    """Stub. Accounts are created already-verified for the demo.

    TODO: issue a short-lived signed verification token, email it, and flip
    is_verified on callback. Set User.is_verified default to False at the same
    time, and gate login on it.
    """
    return {
        "detail": "Verification is stubbed for the demo; this account is already verified.",
        "is_verified": current_user.is_verified,
    }
