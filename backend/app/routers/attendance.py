from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import Attendance, User
from app.schemas import AttendanceOut, AttendanceRow, AttendanceToday
from app.services import attendance_service

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("/today", response_model=AttendanceToday)
def today_status(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> AttendanceToday:
    return attendance_service.get_today_status(db, current_user.id)


@router.post("/check-in", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def check_in(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Attendance:
    return attendance_service.record_check_in(db, current_user)


@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Attendance:
    return attendance_service.record_check_out(db, current_user)


@router.get("/me", response_model=list[AttendanceOut])
def my_attendance(
    range: Literal["day", "week", "month"] = Query("week"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Attendance]:
    return attendance_service.get_user_attendance(db, current_user.id, time_range=range)


@router.get("", response_model=list[AttendanceRow])
def all_attendance(
    on: date | None = Query(None, description="Single day; defaults to today"),
    user_id: int | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[AttendanceRow]:
    return attendance_service.get_all_attendance(
        db, on_date=on, user_id=user_id, limit=limit, offset=offset
    )


@router.get("/{user_id}", response_model=list[AttendanceOut])
def employee_attendance(
    user_id: int,
    range: Literal["day", "week", "month"] = Query("month"),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[Attendance]:
    return attendance_service.get_user_attendance(db, user_id, time_range=range)
