from datetime import date, datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import Attendance, AttendanceStatus, Profile, User
from app.schemas import AttendanceOut, AttendanceRow, AttendanceToday

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _today() -> date:
    return datetime.now(timezone.utc).astimezone().date()


def _todays_record(db: Session, user_id: int) -> Attendance | None:
    return (
        db.query(Attendance)
        .filter(Attendance.user_id == user_id, Attendance.date == _today())
        .one_or_none()
    )


# Literal paths are declared before /{user_id} so "me" and "today" are never
# parsed as an int path param.


@router.get("/today", response_model=AttendanceToday)
def today_status(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> AttendanceToday:
    """Drives the button state, so the UI never offers an action that would 400."""
    record = _todays_record(db, current_user.id)
    return AttendanceToday(
        date=_today(),
        checked_in=record is not None and record.check_in is not None,
        checked_out=record is not None and record.check_out is not None,
        record=AttendanceOut.model_validate(record) if record else None,
    )


@router.post("/check-in", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def check_in(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Attendance:
    if _todays_record(db, current_user.id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already checked in today"
        )
    record = Attendance(
        user_id=current_user.id,
        date=_today(),
        check_in=datetime.now(timezone.utc),
        status=AttendanceStatus.present,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Attendance:
    record = _todays_record(db, current_user.id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Check in before checking out"
        )
    if record.check_out is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already checked out today"
        )
    record.check_out = datetime.now(timezone.utc)
    db.commit()
    db.refresh(record)
    return record


@router.get("/me", response_model=list[AttendanceOut])
def my_attendance(
    range: Literal["day", "week", "month"] = Query("week"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Attendance]:
    spans = {"day": 0, "week": 6, "month": 29}
    start = _today() - timedelta(days=spans[range])
    return (
        db.query(Attendance)
        .filter(Attendance.user_id == current_user.id, Attendance.date >= start)
        .order_by(Attendance.date.desc())
        .all()
    )


@router.get("", response_model=list[AttendanceRow])
def all_attendance(
    on: date | None = Query(None, description="Single day; defaults to today"),
    user_id: int | None = Query(None),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[AttendanceRow]:
    query = (
        db.query(Attendance)
        .options(joinedload(Attendance.user).joinedload(User.profile))
        .filter(Attendance.date == (on or _today()))
    )
    if user_id is not None:
        query = query.filter(Attendance.user_id == user_id)

    return [
        AttendanceRow(
            id=r.id,
            user_id=r.user_id,
            date=r.date,
            check_in=r.check_in,
            check_out=r.check_out,
            status=r.status,
            employee_id=r.user.employee_id,
            full_name=r.user.profile.full_name,
        )
        for r in query.join(User).join(Profile).order_by(Profile.full_name).all()
    ]


@router.get("/{user_id}", response_model=list[AttendanceOut])
def employee_attendance(
    user_id: int,
    range: Literal["day", "week", "month"] = Query("month"),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[Attendance]:
    spans = {"day": 0, "week": 6, "month": 29}
    start = _today() - timedelta(days=spans[range])
    return (
        db.query(Attendance)
        .filter(Attendance.user_id == user_id, Attendance.date >= start)
        .order_by(Attendance.date.desc())
        .all()
    )
