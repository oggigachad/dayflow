from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import Notification, Role, User

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=1000)
    type: str = Field(default="info", max_length=40)
    user_id: int | None = None  # None for broadcast to all employees


class NotificationOut(BaseModel):
    id: int
    user_id: int | None = None
    title: str
    message: str
    type: str
    created_at: datetime


@router.get("", response_model=list[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Notification]:
    # Returns notifications sent directly to user OR broadcasts (user_id is None)
    return (
        db.query(Notification)
        .filter(
            (Notification.user_id == current_user.id) | (Notification.user_id.is_(None))
        )
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )


@router.post("", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Notification:
    notif = Notification(
        user_id=payload.user_id,
        title=payload.title,
        message=payload.message,
        type=payload.type,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    notif = db.get(Notification, notification_id)
    if notif is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
    db.delete(notif)
    db.commit()
