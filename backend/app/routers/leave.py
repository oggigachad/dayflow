from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import LeaveStatus, User
from app.schemas import LeaveCreate, LeaveDecision, LeaveOut, LeaveRow
from app.services import leave_service

router = APIRouter(prefix="/leave", tags=["leave"])


@router.post("", response_model=LeaveOut, status_code=status.HTTP_201_CREATED)
def apply_for_leave(
    payload: LeaveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeaveOut:
    return leave_service.apply_leave(db, current_user, payload)


@router.get("/me", response_model=list[LeaveOut])
def my_leave(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[LeaveOut]:
    return leave_service.get_user_leaves(db, current_user.id)


@router.get("", response_model=list[LeaveRow])
def all_leave(
    status_filter: LeaveStatus | None = Query(None, alias="status"),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[LeaveRow]:
    return leave_service.get_all_leaves(
        db, status_filter=status_filter, limit=limit, offset=offset
    )


@router.patch("/{leave_id}", response_model=LeaveRow)
def decide_leave(
    leave_id: int,
    payload: LeaveDecision,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> LeaveRow:
    return leave_service.process_leave_decision(db, current_user, leave_id, payload)
