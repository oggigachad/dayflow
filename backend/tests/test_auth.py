from app.security import decode_token


def test_signup_success(client):
    payload = {
        "employee_id": "EMP201",
        "email": "new.hire@dayflow.in",
        "password": "Password123",
        "role": "employee",
        "full_name": "New Hire",
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

    claims = decode_token(data["access_token"], "access")
    assert claims["role"] == "employee"


def test_signup_duplicate_email_fails(client, employee_user):
    payload = {
        "employee_id": "DIFF101",
        "email": employee_user.email,
        "password": "Password123",
        "role": "employee",
        "full_name": "Duplicate User",
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_login_success(client, employee_user):
    response = client.post(
        "/auth/login",
        json={"email": employee_user.email, "password": "dayflow123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_invalid_password_fails(client, employee_user):
    response = client.post(
        "/auth/login",
        json={"email": employee_user.email, "password": "wrongpassword1"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_auth_me_endpoint(client, employee_headers, employee_user):
    response = client.get("/auth/me", headers=employee_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == employee_user.email
    assert data["employee_id"] == employee_user.employee_id
    assert data["profile"]["full_name"] == "Employee Test"
