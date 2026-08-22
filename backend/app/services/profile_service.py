from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Profile, User
from app.schemas import ProfileAdminUpdate, ProfileSelfUpdate
from app.services.audit_service import record_audit


def get_profile_by_user_id(db: Session, user_id: int) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user_id).one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


def update_self_profile(db: Session, user: User, payload: ProfileSelfUpdate) -> Profile:
    profile = get_profile_by_user_id(db, user.id)
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(profile, field, value)

    record_audit(
        db,
        actor_id=user.id,
        action="profile.self_update",
        target_table="profiles",
        target_id=profile.id,
        metadata={"fields_updated": list(changes.keys())},
    )
    db.commit()
    db.refresh(profile)
    return profile


def update_employee_profile_admin(
    db: Session, admin_user: User, target_user_id: int, payload: ProfileAdminUpdate
) -> Profile:
    profile = get_profile_by_user_id(db, target_user_id)
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(profile, field, value)

    record_audit(
        db,
        actor_id=admin_user.id,
        action="profile.admin_update",
        target_table="profiles",
        target_id=profile.id,
        metadata={"target_user_id": target_user_id, "fields_updated": list(changes.keys())},
    )
    db.commit()
    db.refresh(profile)
    return profile
