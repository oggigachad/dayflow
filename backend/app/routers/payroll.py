from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import SalaryStructure, User
from app.schemas import SalaryOut, SalaryUpdate

router = APIRouter(prefix="/payroll", tags=["payroll"])


def _out(salary: SalaryStructure) -> SalaryOut:
    out = SalaryOut.model_validate(salary)
    out.gross = float(salary.base_salary) + sum((salary.allowances or {}).values())
    out.net = out.gross - sum((salary.deductions or {}).values())
    return out


def _salary_or_404(db: Session, user_id: int) -> SalaryStructure:
    salary = (
        db.query(SalaryStructure).filter(SalaryStructure.user_id == user_id).one_or_none()
    )
    if salary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No salary structure on file"
        )
    return salary


@router.get("/me", response_model=SalaryOut)
def my_payroll(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> SalaryOut:
    """Read-only for employees. There is deliberately no PUT /payroll/me."""
    return _out(_salary_or_404(db, current_user.id))


@router.get("/{user_id}", response_model=SalaryOut)
def get_payroll(
    user_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> SalaryOut:
    return _out(_salary_or_404(db, user_id))


@router.put("/{user_id}", response_model=SalaryOut)
def update_payroll(
    user_id: int,
    payload: SalaryUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> SalaryOut:
    salary = _salary_or_404(db, user_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(salary, field, value)
    db.commit()
    db.refresh(salary)
    return _out(salary)
