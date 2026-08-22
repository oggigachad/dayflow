import enum
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Role(str, enum.Enum):
    admin = "admin"
    employee = "employee"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    half_day = "half_day"
    leave = "leave"


class LeaveType(str, enum.Enum):
    paid = "paid"
    sick = "sick"
    unpaid = "unpaid"


class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(SAEnum(Role, name="role"), default=Role.employee)
    # TODO: email verification is stubbed true for the demo. See
    # routers/auth.py::request_verification for where the real flow plugs in.
    is_verified: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    profile: Mapped["Profile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    salary: Mapped["SalaryStructure | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    attendance: Mapped[list["Attendance"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    leave_requests: Mapped[list["LeaveRequest"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(String(300))
    profile_picture_url: Mapped[str | None] = mapped_column(String(500))
    job_title: Mapped[str | None] = mapped_column(String(120))
    department: Mapped[str | None] = mapped_column(String(120))
    date_joined: Mapped[date | None] = mapped_column(Date)
    # Personal + employment detail the admin profile editor collects. Nullable so
    # existing rows stay valid; see main.py::_COLUMN_TOPUPS for the
    # create_all-only schema top-up.
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(40))
    emergency_contact: Mapped[str | None] = mapped_column(String(160))
    work_location: Mapped[str | None] = mapped_column(String(120))
    manager: Mapped[str | None] = mapped_column(String(120))
    employment_type: Mapped[str | None] = mapped_column(String(40))
    employment_status: Mapped[str | None] = mapped_column(String(40))

    user: Mapped[User] = relationship(back_populates="profile")


class SalaryStructure(Base):
    __tablename__ = "salary_structures"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    base_salary: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    allowances: Mapped[dict] = mapped_column(JSONB, default=dict)
    deductions: Mapped[dict] = mapped_column(JSONB, default=dict)
    effective_date: Mapped[date | None] = mapped_column(Date)

    user: Mapped[User] = relationship(back_populates="salary")


class Attendance(Base):
    __tablename__ = "attendance"
    # One row per employee per day — makes a double check-in impossible at the
    # DB level, not just in the handler.
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_attendance_user_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    date: Mapped[date] = mapped_column(Date, index=True)
    check_in: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    check_out: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[AttendanceStatus] = mapped_column(
        SAEnum(AttendanceStatus, name="attendance_status"),
        default=AttendanceStatus.present,
    )

    user: Mapped[User] = relationship(back_populates="attendance")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    leave_type: Mapped[LeaveType] = mapped_column(SAEnum(LeaveType, name="leave_type"))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    remarks: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[LeaveStatus] = mapped_column(
        SAEnum(LeaveStatus, name="leave_status"), default=LeaveStatus.pending, index=True
    )
    admin_comment: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped[User] = relationship(back_populates="leave_requests")
