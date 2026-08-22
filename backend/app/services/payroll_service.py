from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import SalaryStructure, User
from app.schemas import SalaryOut, SalaryUpdate
from app.services.audit_service import record_audit


def format_salary_out(salary: SalaryStructure) -> SalaryOut:
    out = SalaryOut.model_validate(salary)
    out.gross = float(salary.base_salary) + sum((salary.allowances or {}).values())
    out.net = out.gross - sum((salary.deductions or {}).values())
    return out


def get_salary_by_user_id(db: Session, user_id: int) -> SalaryStructure:
    salary = (
        db.query(SalaryStructure)
        .filter(SalaryStructure.user_id == user_id)
        .order_by(SalaryStructure.effective_date.desc().nullslast(), SalaryStructure.created_at.desc())
        .first()
    )
    if salary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No salary structure on file"
        )
    return salary


def update_employee_salary(
    db: Session, admin_user: User, user_id: int, payload: SalaryUpdate
) -> SalaryOut:
    salary = get_salary_by_user_id(db, user_id)
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(salary, field, value)

    record_audit(
        db,
        actor_id=admin_user.id,
        action="payroll.update",
        target_table="salary_structures",
        target_id=salary.id,
        metadata={"target_user_id": user_id, "fields_updated": list(changes.keys())},
    )
    db.commit()
    db.refresh(salary)
    return format_salary_out(salary)
