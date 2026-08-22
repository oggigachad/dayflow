from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import User
from app.schemas import SalaryOut, SalaryUpdate
from app.services import payroll_service

router = APIRouter(prefix="/payroll", tags=["payroll"])


@router.get("/me", response_model=SalaryOut)
def my_payroll(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> SalaryOut:
    """Read-only for employees. There is deliberately no PUT /payroll/me."""
    salary = payroll_service.get_salary_by_user_id(db, current_user.id)
    return payroll_service.format_salary_out(salary)


@router.get("/{user_id}", response_model=SalaryOut)
def get_payroll(
    user_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> SalaryOut:
    salary = payroll_service.get_salary_by_user_id(db, user_id)
    return payroll_service.format_salary_out(salary)


@router.put("/{user_id}", response_model=SalaryOut)
def update_payroll(
    user_id: int,
    payload: SalaryUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> SalaryOut:
    return payroll_service.update_employee_salary(db, current_user, user_id, payload)
