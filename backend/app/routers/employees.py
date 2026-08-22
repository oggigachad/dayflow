from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import require_admin
from app.models import Profile, User
from app.schemas import EmployeeListItem, UserOut

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=list[EmployeeListItem])
def list_employees(
    _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> list[EmployeeListItem]:
    rows = (
        db.query(User)
        .options(joinedload(User.profile))
        .join(Profile)
        .order_by(Profile.full_name)
        .all()
    )
    return [
        EmployeeListItem(
            id=u.id,
            employee_id=u.employee_id,
            email=u.email,
            role=u.role,
            full_name=u.profile.full_name,
            phone=u.profile.phone,
            address=u.profile.address,
            profile_picture_url=u.profile.profile_picture_url,
            job_title=u.profile.job_title,
            department=u.profile.department,
            date_joined=u.profile.date_joined,
            date_of_birth=u.profile.date_of_birth,
            gender=u.profile.gender,
            emergency_contact=u.profile.emergency_contact,
            work_location=u.profile.work_location,
            manager=u.profile.manager,
            employment_type=u.profile.employment_type,
            employment_status=u.profile.employment_status,
        )
        for u in rows
    ]


@router.get("/{user_id}", response_model=UserOut)
def get_employee(
    user_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return user
