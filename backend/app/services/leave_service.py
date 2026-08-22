from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models import LeaveRequest, LeaveStatus, Profile, User
from app.schemas import LeaveCreate, LeaveDecision, LeaveOut, LeaveRow
from app.services.audit_service import record_audit


def calculate_leave_days(leave: LeaveRequest) -> int:
    return (leave.end_date - leave.start_date).days + 1


def format_leave_out(leave: LeaveRequest) -> LeaveOut:
    out = LeaveOut.model_validate(leave)
    out.days = calculate_leave_days(leave)
    return out


def apply_leave(db: Session, user: User, payload: LeaveCreate) -> LeaveOut:
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_date cannot be before start_date",
        )

    leave = LeaveRequest(
        user_id=user.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        remarks=payload.remarks,
        status=LeaveStatus.pending,
    )
    db.add(leave)
    db.flush()

    record_audit(
        db,
        actor_id=user.id,
        action="leave.apply",
        target_table="leave_requests",
        target_id=leave.id,
        metadata={
            "type": payload.leave_type.value,
            "start": payload.start_date.isoformat(),
            "end": payload.end_date.isoformat(),
            "days": calculate_leave_days(leave),
        },
    )
    db.commit()
    db.refresh(leave)
    return format_leave_out(leave)


def get_user_leaves(db: Session, user_id: int) -> list[LeaveOut]:
    rows = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.user_id == user_id)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )
    return [format_leave_out(r) for r in rows]


def get_all_leaves(
    db: Session, status_filter: LeaveStatus | None = None, limit: int = 100, offset: int = 0
) -> list[LeaveRow]:
    query = db.query(LeaveRequest).options(
        joinedload(LeaveRequest.user).joinedload(User.profile)
    )
    if status_filter is not None:
        query = query.filter(LeaveRequest.status == status_filter)

    rows = (
        query.order_by(LeaveRequest.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        LeaveRow(
            **format_leave_out(r).model_dump(),
            employee_id=r.user.employee_id,
            full_name=r.user.profile.full_name,
        )
        for r in rows
    ]


def process_leave_decision(
    db: Session, admin_user: User, leave_id: int, decision: LeaveDecision
) -> LeaveRow:
    leave = (
        db.query(LeaveRequest)
        .options(joinedload(LeaveRequest.user).joinedload(User.profile))
        .filter(LeaveRequest.id == leave_id)
        .one_or_none()
    )
    if leave is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found"
        )
    # A decision is final — re-deciding would silently overwrite the audit trail.
    if leave.status is not LeaveStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"This request was already {leave.status.value}",
        )

    leave.status = decision.status
    leave.admin_comment = decision.admin_comment
    leave.reviewed_by = admin_user.id

    action_name = f"leave.{decision.status.value}"
    record_audit(
        db,
        actor_id=admin_user.id,
        action=action_name,
        target_table="leave_requests",
        target_id=leave.id,
        metadata={
            "employee_id": leave.user.employee_id,
            "decision": decision.status.value,
            "admin_comment": decision.admin_comment,
        },
    )

    db.commit()
    db.refresh(leave)
    return LeaveRow(
        **format_leave_out(leave).model_dump(),
        employee_id=leave.user.employee_id,
        full_name=leave.user.profile.full_name,
    )
