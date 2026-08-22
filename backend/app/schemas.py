import re
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.models import AttendanceStatus, LeaveStatus, LeaveType, Role

PASSWORD_RULE = "Password must be at least 8 characters and contain a letter and a digit."


def _validate_password(value: str) -> str:
    if len(value) < 8 or not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
        raise ValueError(PASSWORD_RULE)
    return value


# --- auth ---------------------------------------------------------------


class SignupIn(BaseModel):
    employee_id: str = Field(min_length=1, max_length=32)
    email: EmailStr
    password: str
    role: Role = Role.employee
    full_name: str = Field(min_length=1, max_length=120)

    _check_password = field_validator("password")(_validate_password)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# --- profile ------------------------------------------------------------


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str
    phone: str | None = None
    address: str | None = None
    profile_picture_url: str | None = None
    job_title: str | None = None
    department: str | None = None
    date_joined: date | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    emergency_contact: str | None = None
    work_location: str | None = None
    manager: str | None = None
    employment_type: str | None = None
    employment_status: str | None = None


class ProfileSelfUpdate(BaseModel):
    """What an employee may change about themselves.

    extra="forbid" makes this a real boundary: sending job_title or department
    is a 422, not a silently-dropped field. Job title and department are the
    admin's to set.
    """

    model_config = ConfigDict(extra="forbid")

    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=300)
    profile_picture_url: str | None = Field(default=None, max_length=500)


class ProfileAdminUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=300)
    profile_picture_url: str | None = Field(default=None, max_length=500)
    job_title: str | None = Field(default=None, max_length=120)
    department: str | None = Field(default=None, max_length=120)
    date_joined: date | None = None
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=40)
    emergency_contact: str | None = Field(default=None, max_length=160)
    work_location: str | None = Field(default=None, max_length=120)
    manager: str | None = Field(default=None, max_length=120)
    employment_type: str | None = Field(default=None, max_length=40)
    employment_status: str | None = Field(default=None, max_length=40)


# --- users --------------------------------------------------------------


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    email: EmailStr
    role: Role
    is_verified: bool
    created_at: datetime
    profile: ProfileOut | None = None


class EmployeeListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    email: EmailStr
    role: Role
    full_name: str
    # The admin directory renders contact details and opens the profile editor
    # straight from this list, so it has to carry the whole profile — a partial
    # row means the editor loads blanks and saves them back over real data.
    phone: str | None = None
    address: str | None = None
    profile_picture_url: str | None = None
    job_title: str | None = None
    department: str | None = None
    date_joined: date | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    emergency_contact: str | None = None
    work_location: str | None = None
    manager: str | None = None
    employment_type: str | None = None
    employment_status: str | None = None


# --- attendance ---------------------------------------------------------


class AttendanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    date: date
    check_in: datetime | None = None
    check_out: datetime | None = None
    status: AttendanceStatus


class AttendanceRow(AttendanceOut):
    """Admin table row — carries who it belongs to."""

    employee_id: str
    full_name: str


class AttendanceToday(BaseModel):
    """Drives the check-in/check-out button state."""

    date: date
    checked_in: bool
    checked_out: bool
    record: AttendanceOut | None = None


# --- leave --------------------------------------------------------------


class LeaveCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    remarks: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def check_range(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")
        return self


class LeaveOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    leave_type: LeaveType
    start_date: date
    end_date: date
    remarks: str | None = None
    status: LeaveStatus
    admin_comment: str | None = None
    created_at: datetime
    updated_at: datetime
    days: int = 0


class LeaveRow(LeaveOut):
    """Admin queue row — carries who it belongs to."""

    employee_id: str
    full_name: str


class LeaveDecision(BaseModel):
    status: LeaveStatus
    admin_comment: str | None = Field(default=None, max_length=500)

    @field_validator("status")
    @classmethod
    def only_decisions(cls, value: LeaveStatus) -> LeaveStatus:
        if value is LeaveStatus.pending:
            raise ValueError("A decision must be approved or rejected")
        return value


# --- payroll ------------------------------------------------------------


class SalaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    base_salary: float
    allowances: dict[str, float] = Field(default_factory=dict)
    deductions: dict[str, float] = Field(default_factory=dict)
    effective_date: date | None = None
    gross: float = 0
    net: float = 0


class SalaryUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    base_salary: float | None = Field(default=None, ge=0)
    allowances: dict[str, float] | None = None
    deductions: dict[str, float] | None = None
    effective_date: date | None = None


# --- analytics ----------------------------------------------------------


class AnalyticsSummary(BaseModel):
    total_employees: int
    present_today: int
    on_leave_today: int
    pending_leave_requests: int


# --- documents ----------------------------------------------------------


class DocumentCreate(BaseModel):
    document_type: str = Field(min_length=1, max_length=80)
    file_name: str = Field(min_length=1, max_length=255)
    file_size: str = Field(default="1.2 MB", max_length=32)


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    document_type: str
    file_name: str
    file_size: str
    created_at: datetime


# --- leave on behalf ---------------------------------------------------


class LeaveOnBehalfCreate(LeaveCreate):
    user_id: int
