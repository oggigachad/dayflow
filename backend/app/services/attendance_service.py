from datetime import date, datetime, timedelta, timezone
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models import Attendance, AttendanceStatus, Profile, User
from app.schemas import AttendanceOut, AttendanceRow, AttendanceToday
from app.services.audit_service import record_audit


def get_current_date() -> date:
    return datetime.now(timezone.utc).astimezone().date()


def get_today_record(db: Session, user_id: int, on_date: date | None = None) -> Attendance | None:
    target_date = on_date or get_current_date()
    return (
        db.query(Attendance)
        .filter(Attendance.user_id == user_id, Attendance.date == target_date)
        .one_or_none()
    )


def get_today_status(db: Session, user_id: int) -> AttendanceToday:
    today = get_current_date()
    record = get_today_record(db, user_id, today)
    return AttendanceToday(
        date=today,
        checked_in=record is not None and record.check_in is not None,
        checked_out=record is not None and record.check_out is not None,
        record=AttendanceOut.model_validate(record) if record else None,
    )


def record_check_in(db: Session, user: User) -> Attendance:
    today = get_current_date()
    if get_today_record(db, user.id, today) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already checked in today"
        )
    now = datetime.now(timezone.utc)
    record = Attendance(
        user_id=user.id,
        date=today,
        check_in=now,
        status=AttendanceStatus.present,
    )
    db.add(record)
    record_audit(
        db,
        actor_id=user.id,
        action="attendance.check_in",
        target_table="attendance",
        metadata={"date": today.isoformat(), "time": now.isoformat()},
    )
    db.commit()
    db.refresh(record)
    return record


def record_check_out(db: Session, user: User) -> Attendance:
    today = get_current_date()
    record = get_today_record(db, user.id, today)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Check in before checking out"
        )
    if record.check_out is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Already checked out today"
        )
    now = datetime.now(timezone.utc)
    record.check_out = now
    record_audit(
        db,
        actor_id=user.id,
        action="attendance.check_out",
        target_table="attendance",
        target_id=record.id,
        metadata={"date": today.isoformat(), "time": now.isoformat()},
    )
    db.commit()
    db.refresh(record)
    return record


def get_user_attendance(
    db: Session, user_id: int, time_range: Literal["day", "week", "month"] = "week"
) -> list[Attendance]:
    spans = {"day": 0, "week": 6, "month": 29}
    start = get_current_date() - timedelta(days=spans.get(time_range, 6))
    return (
        db.query(Attendance)
        .filter(Attendance.user_id == user_id, Attendance.date >= start)
        .order_by(Attendance.date.desc())
        .all()
    )


def get_all_attendance(
    db: Session,
    on_date: date | None = None,
    user_id: int | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[AttendanceRow]:
    target_date = on_date or get_current_date()
    query = (
        db.query(Attendance)
        .options(joinedload(Attendance.user).joinedload(User.profile))
        .filter(Attendance.date == target_date)
    )
    if user_id is not None:
        query = query.filter(Attendance.user_id == user_id)

    records = (
        query.join(User)
        .join(Profile)
        .order_by(Profile.full_name)
        .offset(offset)
        .limit(limit)
        .all()
    )

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
        for r in records
    ]
