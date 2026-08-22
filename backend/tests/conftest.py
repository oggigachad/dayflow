from datetime import date
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Profile, Role, SalaryStructure, User
from app.security import create_access_token, hash_password

# In-memory SQLite database for unit tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db):
    user = User(
        employee_id="ADM999",
        email="admin.test@dayflow.in",
        password_hash=hash_password("dayflow123"),
        role=Role.admin,
        is_verified=True,
    )
    user.profile = Profile(full_name="Admin Test", job_title="HR Lead", department="People")
    user.salary = SalaryStructure(base_salary=2_000_000, effective_date=date(2026, 1, 1))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def employee_user(db):
    user = User(
        employee_id="EMP999",
        email="emp.test@dayflow.in",
        password_hash=hash_password("dayflow123"),
        role=Role.employee,
        is_verified=True,
    )
    user.profile = Profile(full_name="Employee Test", job_title="Developer", department="Tech")
    user.salary = SalaryStructure(base_salary=1_000_000, effective_date=date(2026, 1, 1))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user):
    return create_access_token(admin_user.id, Role.admin.value)


@pytest.fixture
def employee_token(employee_user):
    return create_access_token(employee_user.id, Role.employee.value)


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def employee_headers(employee_token):
    return {"Authorization": f"Bearer {employee_token}"}
