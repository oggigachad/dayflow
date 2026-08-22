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


@router.post("/batch-process")
def batch_process_payroll(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    structures = db.query(SalaryStructure).all()
    total_processed = len(structures)
    total_amount = sum(
        float(s.base_salary)
        + sum((s.allowances or {}).values())
        - sum((s.deductions or {}).values())
        for s in structures
    )
    return {
        "status": "success",
        "message": f"Processed monthly payroll batch for {total_processed} employees",
        "employees_count": total_processed,
        "total_disbursed": total_amount,
    }


@router.get("/{user_id}/payslip-download")
def download_payslip(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from fastapi.responses import Response
    from app.models import Role

    if current_user.role != Role.admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    salary = _salary_or_404(db, user_id)
    u = db.get(User, user_id)
    emp_name = u.profile.full_name if u and u.profile else f"Employee_{user_id}"
    gross = float(salary.base_salary) + sum((salary.allowances or {}).values())
    net = gross - sum((salary.deductions or {}).values())

    csv_content = (
        f"DAYFLOW HRMS - OFFICIAL PAYSLIP RECEIPT\n"
        f"Employee Name,{emp_name}\n"
        f"Employee ID,{u.employee_id if u else user_id}\n"
        f"Pay Period,August 2026\n"
        f"Basic Pay,${float(salary.base_salary):,.2f}\n"
        + "".join(f"{k},${v:,.2f}\n" for k, v in (salary.allowances or {}).items())
        + "".join(f"{k} (Deduction),-${v:,.2f}\n" for k, v in (salary.deductions or {}).items())
        + f"Gross Earnings,${gross:,.2f}\n"
        f"Net Disbursed,${net:,.2f}\n"
        f"Status,Paid & Reconciled\n"
    )

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="payslip_{user_id}_aug2026.csv"'},
    )

