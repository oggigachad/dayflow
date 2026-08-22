from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import Profile, User
from app.schemas import ProfileAdminUpdate, ProfileOut, ProfileSelfUpdate
from app.services import profile_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Profile:
    return profile_service.get_profile_by_user_id(db, current_user.id)


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileSelfUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Profile:
    return profile_service.update_self_profile(db, current_user, payload)


@router.get("/{user_id}", response_model=ProfileOut)
def get_profile(
    user_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> Profile:
    return profile_service.get_profile_by_user_id(db, user_id)


@router.put("/{user_id}", response_model=ProfileOut)
def update_profile(
    user_id: int,
    payload: ProfileAdminUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Profile:
    return profile_service.update_employee_profile_admin(db, current_user, user_id, payload)
