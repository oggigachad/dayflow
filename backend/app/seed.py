"""Seed realistic demo data. Idempotent: wipes and rebuilds the demo rows.

Run with:  uv run python -m app.seed

An empty table kills a demo, so this creates attendance history and leave
requests in every status, plus today's check-in already done for one employee
and deliberately *not* done for another, so both button states are visible.
"""

from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import delete

from app.database import Base, SessionLocal, engine
from app.models import (
    Attendance,
    AttendanceStatus,
    AuditLog,
    LeaveRequest,
    LeaveStatus,
    LeaveType,
    Profile,
    Role,
    SalaryStructure,
    User,
)
from app.security import hash_password

PASSWORD = "dayflow123"
TODAY = datetime.now(timezone.utc).astimezone().date()

PEOPLE = [
    {
        "employee_id": "ADM001",
        "email": "priya.nair@dayflow.in",
        "role": Role.admin,
        "full_name": "Priya Nair",
        "job_title": "HR Director",
        "department": "People",
        "phone": "+91 98450 11223",
        "address": "14, Indiranagar 100ft Road, Bengaluru 560038",
        "date_joined": date(2021, 3, 15),
        "base_salary": 2_400_000,
        "allowances": {"hra": 480_000, "travel": 120_000},
        "deductions": {"pf": 288_000, "professional_tax": 2_400},
    },
    {
        "employee_id": "EMP101",
        "email": "arjun.rao@dayflow.in",
        "role": Role.employee,
        "full_name": "Arjun Rao",
        "job_title": "Senior Backend Engineer",
        "department": "Engineering",
        "phone": "+91 99001 44556",
        "address": "203, Koramangala 5th Block, Bengaluru 560095",
        "date_joined": date(2022, 7, 4),
        "base_salary": 1_800_000,
        "allowances": {"hra": 360_000, "internet": 24_000},
        "deductions": {"pf": 216_000, "professional_tax": 2_400},
    },
    {
        "employee_id": "EMP102",
        "email": "meera.iyer@dayflow.in",
        "role": Role.employee,
        "full_name": "Meera Iyer",
        "job_title": "Product Designer",
        "department": "Design",
        "phone": "+91 97400 77889",
        "address": "7B, Jayanagar 4th Block, Bengaluru 560011",
        "date_joined": date(2023, 1, 9),
        "base_salary": 1_450_000,
        "allowances": {"hra": 290_000, "internet": 24_000},
        "deductions": {"pf": 174_000, "professional_tax": 2_400},
    },
    {
        "employee_id": "EMP103",
        "email": "rohit.desai@dayflow.in",
        "role": Role.employee,
        "full_name": "Rohit Desai",
        "job_title": "QA Engineer",
        "department": "Engineering",
        "phone": "+91 96320 33445",
        "address": "12, Powai Lake View, Mumbai 400076",
        "date_joined": date(2024, 9, 2),
        "base_salary": 1_100_000,
        "allowances": {"hra": 220_000, "internet": 24_000},
        "deductions": {"pf": 132_000, "professional_tax": 2_400},
    },
]


def _stamp(day: date, at: time) -> datetime:
    """A local-time wall clock on a given day, as an aware datetime."""
    return datetime.combine(day, at).astimezone()


def _attendance_history(user_id: int, weeks: int = 3) -> list[Attendance]:
    """Weekday history. Skips today so the check-in button state is seeded per user."""
    rows = []
    for offset in range(1, weeks * 7 + 1):
        day = TODAY - timedelta(days=offset)
        if day.weekday() >= 5:  # weekend
            continue
        if offset % 11 == 0:
            rows.append(Attendance(user_id=user_id, date=day, status=AttendanceStatus.absent))
            continue
        if offset % 7 == 0:
            rows.append(
                Attendance(
                    user_id=user_id,
                    date=day,
                    check_in=_stamp(day, time(9, 40)),
                    check_out=_stamp(day, time(13, 30)),
                    status=AttendanceStatus.half_day,
                )
            )
            continue
        rows.append(
            Attendance(
                user_id=user_id,
                date=day,
                check_in=_stamp(day, time(9, 12 + offset % 20)),
                check_out=_stamp(day, time(18, 5 + offset % 25)),
                status=AttendanceStatus.present,
            )
        )
    return rows


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.execute(delete(User).where(User.email.in_([p["email"] for p in PEOPLE])))
        db.commit()

        users: dict[str, User] = {}
        for person in PEOPLE:
            user = User(
                employee_id=person["employee_id"],
                email=person["email"],
                password_hash=hash_password(PASSWORD),
                role=person["role"],
                is_verified=True,
            )
            user.profile = Profile(
                full_name=person["full_name"],
                phone=person["phone"],
                address=person["address"],
                job_title=person["job_title"],
                department=person["department"],
                date_joined=person["date_joined"],
            )
            user.salary = SalaryStructure(
                base_salary=person["base_salary"],
                allowances=person["allowances"],
                deductions=person["deductions"],
                effective_date=date(TODAY.year, 4, 1),
            )
            db.add(user)
            users[person["employee_id"]] = user
        db.commit()

        priya = users["ADM001"]
        arjun, meera, rohit = users["EMP101"], users["EMP102"], users["EMP103"]

        for user in (arjun, meera, rohit):
            db.add_all(_attendance_history(user.id))

        db.add(
            Attendance(
                user_id=arjun.id,
                date=TODAY,
                check_in=_stamp(TODAY, time(9, 18)),
                status=AttendanceStatus.present,
            )
        )

        db.add_all(
            [
                LeaveRequest(
                    user_id=meera.id,
                    leave_type=LeaveType.paid,
                    start_date=TODAY + timedelta(days=5),
                    end_date=TODAY + timedelta(days=9),
                    remarks="Family wedding in Kochi.",
                    status=LeaveStatus.pending,
                ),
                LeaveRequest(
                    user_id=rohit.id,
                    leave_type=LeaveType.sick,
                    start_date=TODAY + timedelta(days=1),
                    end_date=TODAY + timedelta(days=2),
                    remarks="Dental surgery, doctor advised two days' rest.",
                    status=LeaveStatus.pending,
                ),
                LeaveRequest(
                    user_id=rohit.id,
                    leave_type=LeaveType.paid,
                    start_date=TODAY - timedelta(days=1),
                    end_date=TODAY,
                    remarks="Extending the long weekend.",
                    status=LeaveStatus.approved,
                    reviewed_by=priya.id,
                    admin_comment="Approved. Please hand over the regression suite.",
                ),
                LeaveRequest(
                    user_id=arjun.id,
                    leave_type=LeaveType.unpaid,
                    start_date=TODAY - timedelta(days=20),
                    end_date=TODAY - timedelta(days=14),
                    remarks="Sabbatical week.",
                    status=LeaveStatus.rejected,
                    reviewed_by=priya.id,
                    admin_comment="Rejected — clashes with the release freeze. Re-apply for July.",
                ),
                LeaveRequest(
                    user_id=meera.id,
                    leave_type=LeaveType.sick,
                    start_date=TODAY - timedelta(days=30),
                    end_date=TODAY - timedelta(days=29),
                    remarks="Viral fever.",
                    status=LeaveStatus.approved,
                    reviewed_by=priya.id,
                    admin_comment="Get well soon.",
                ),
            ]
        )

        # Seed audit log entries
        db.add_all(
            [
                AuditLog(
                    actor_id=priya.id,
                    action="leave.approve",
                    target_table="leave_requests",
                    metadata_payload={"employee": "rohit.desai@dayflow.in", "decision": "approved"},
                ),
                AuditLog(
                    actor_id=priya.id,
                    action="leave.reject",
                    target_table="leave_requests",
                    metadata_payload={"employee": "arjun.rao@dayflow.in", "decision": "rejected"},
                ),
                AuditLog(
                    actor_id=priya.id,
                    action="payroll.update",
                    target_table="salary_structures",
                    metadata_payload={"target_employee": "arjun.rao@dayflow.in", "revised_base": 1_800_000},
                ),
            ]
        )

        db.commit()

        print(f"Seeded {len(PEOPLE)} users (password for all: {PASSWORD})")
        for person in PEOPLE:
            print(f"  {person['role'].value:8} {person['email']}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
