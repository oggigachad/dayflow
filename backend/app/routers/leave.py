from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import LeaveRequest, LeaveStatus, Profile, User
from app.schemas import LeaveCreate, LeaveDecision, LeaveOut, LeaveRow

router = APIRouter(prefix="/leave", tags=["leave"])


def _days(leave: LeaveRequest) -> int:
    return (leave.end_date - leave.start_date).days + 1


def _out(leave: LeaveRequest) -> LeaveOut:
    out = LeaveOut.model_validate(leave)
    out.days = _days(leave)
    return out


@router.post("", response_model=LeaveOut, status_code=status.HTTP_201_CREATED)
def apply_for_leave(
    payload: LeaveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeaveOut:
    leave = LeaveRequest(
        user_id=current_user.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        remarks=payload.remarks,
        status=LeaveStatus.pending,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return _out(leave)


@router.get("/me", response_model=list[LeaveOut])
def my_leave(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[LeaveOut]:
    rows = (
        db.query(LeaveRequest)
        .filter(LeaveRequest.user_id == current_user.id)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )
    return [_out(r) for r in rows]


@router.get("", response_model=list[LeaveRow])
def all_leave(
    status_filter: LeaveStatus | None = Query(None, alias="status"),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[LeaveRow]:
    query = db.query(LeaveRequest).options(
        joinedload(LeaveRequest.user).joinedload(User.profile)
    )
    if status_filter is not None:
        query = query.filter(LeaveRequest.status == status_filter)

    rows = query.order_by(LeaveRequest.created_at.desc()).all()
    return [
        LeaveRow(
            **_out(r).model_dump(),
            employee_id=r.user.employee_id,
            full_name=r.user.profile.full_name,
        )
        for r in rows
    ]


@router.patch("/{leave_id}", response_model=LeaveRow)
def decide_leave(
    leave_id: int,
    payload: LeaveDecision,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> LeaveRow:
    leave = db.get(LeaveRequest, leave_id)
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

    leave.status = payload.status
    leave.admin_comment = payload.admin_comment
    db.commit()
    db.refresh(leave)
    return LeaveRow(
        **_out(leave).model_dump(),
        employee_id=leave.user.employee_id,
        full_name=leave.user.profile.full_name,
    )
