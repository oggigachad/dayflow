def test_profile_self_update_allowed_fields(client, employee_headers):
    res = client.put(
        "/profile/me",
        headers=employee_headers,
        json={"phone": "+91 99999 88888", "address": "New Apartment, Floor 4"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["phone"] == "+91 99999 88888"
    assert data["address"] == "New Apartment, Floor 4"


def test_profile_self_update_forbidden_fields(client, employee_headers):
    # Sending job_title or department to /profile/me is a 422 Unprocessable Entity
    res = client.put(
        "/profile/me",
        headers=employee_headers,
        json={"job_title": "CEO", "department": "Executive"},
    )
    assert res.status_code == 422


def test_employee_cannot_access_admin_routes(client, employee_headers, admin_user):
    # Cannot view another's profile via admin route
    res = client.get(f"/profile/{admin_user.id}", headers=employee_headers)
    assert res.status_code == 403

    # Cannot update another's profile
    res = client.put(
        f"/profile/{admin_user.id}",
        headers=employee_headers,
        json={"job_title": "Intern"},
    )
    assert res.status_code == 403

    # Cannot write payroll for self or others
    res = client.put(
        "/payroll/me",
        headers=employee_headers,
        json={"base_salary": 9_999_999},
    )
    assert res.status_code == 403

    # Cannot view audit logs
    res = client.get("/audit", headers=employee_headers)
    assert res.status_code == 403
