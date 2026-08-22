from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine
from app.routers import analytics, attendance, auth, employees, leave, payroll, profile

# create_all never ALTERs an existing table, so columns added after a database
# was first created would be missing at runtime. Until Alembic lands, top them
# up idempotently. Additive and nullable only — never a rename or a drop.
_COLUMN_TOPUPS = (
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(40)",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(160)",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_location VARCHAR(120)",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manager VARCHAR(120)",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_type VARCHAR(40)",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_status VARCHAR(40)",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Hackathon speed: create_all instead of Alembic. Swap in migrations before
    # anyone depends on the data surviving a schema change.
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        for statement in _COLUMN_TOPUPS:
            conn.execute(text(statement))
    yield


app = FastAPI(title="Dayflow HRMS API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(leave.router)
app.include_router(payroll.router)
app.include_router(analytics.router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}
