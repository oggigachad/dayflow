from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import Profile, User
from app.schemas import ProfileAdminUpdate, ProfileOut, ProfileSelfUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


def _profile_or_404(db: Session, user_id: int) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user_id).one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Profile:
    return _profile_or_404(db, current_user.id)


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileSelfUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Profile:
    """Employees may only change phone, address, and picture.

    The restriction lives in ProfileSelfUpdate (extra="forbid"), so sending
    job_title here is a 422 rather than a silent no-op.
    """
    profile = _profile_or_404(db, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}", response_model=ProfileOut)
def get_profile(
    user_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> Profile:
    return _profile_or_404(db, user_id)


@router.put("/{user_id}", response_model=ProfileOut)
def update_profile(
    user_id: int,
    payload: ProfileAdminUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Profile:
    profile = _profile_or_404(db, user_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
