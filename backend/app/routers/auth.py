from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import LoginIn, RefreshIn, SignupIn, TokenPair, UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupIn, db: Session = Depends(get_db)) -> TokenPair:
    return auth_service.register_user(db, payload)


@router.post("/login", response_model=TokenPair)
def login(
    payload: LoginIn, request: Request, db: Session = Depends(get_db)
) -> TokenPair:
    client_ip = request.client.host if request.client else "unknown"
    return auth_service.authenticate_user(db, payload, client_ip=client_ip)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshIn, db: Session = Depends(get_db)) -> TokenPair:
    return auth_service.refresh_user_token(db, payload)


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
