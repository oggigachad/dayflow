from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_admin
from app.models import (
    Attendance,
    AttendanceStatus,
    LeaveRequest,
    LeaveStatus,
    Role,
    User,
)
from app.schemas import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
    _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> AnalyticsSummary:
    """Real counts from the DB — nothing here is mocked."""
    today = datetime.now(timezone.utc).astimezone().date()

    total_employees = db.scalar(
        select(func.count()).select_from(User).where(User.role == Role.employee)
    )
    present_today = db.scalar(
        select(func.count())
        .select_from(Attendance)
        .where(Attendance.date == today, Attendance.status == AttendanceStatus.present)
    )
    # An approved leave whose range covers today, rather than a status flag that
    # someone has to remember to set.
    on_leave_today = db.scalar(
        select(func.count(func.distinct(LeaveRequest.user_id))).where(
            LeaveRequest.status == LeaveStatus.approved,
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today,
        )
    )
    pending_leave_requests = db.scalar(
        select(func.count())
        .select_from(LeaveRequest)
        .where(LeaveRequest.status == LeaveStatus.pending)
    )

    return AnalyticsSummary(
        total_employees=total_employees or 0,
        present_today=present_today or 0,
        on_leave_today=on_leave_today or 0,
        pending_leave_requests=pending_leave_requests or 0,
    )
