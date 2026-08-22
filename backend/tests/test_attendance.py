def test_check_in_and_check_out_flow(client, employee_headers):
    # 1. Check today status before checking in
    res = client.get("/attendance/today", headers=employee_headers)
    assert res.status_code == 200
    assert res.json()["checked_in"] is False
    assert res.json()["checked_out"] is False

    # 2. Check-in
    res = client.post("/attendance/check-in", headers=employee_headers)
    assert res.status_code == 201
    assert res.json()["status"] == "present"
    assert res.json()["check_in"] is not None

    # 3. Duplicate check-in fails (enforces DB + logic constraint)
    res = client.post("/attendance/check-in", headers=employee_headers)
    assert res.status_code == 409
    assert "Already checked in today" in res.json()["detail"]

    # 4. Check-out
    res = client.post("/attendance/check-out", headers=employee_headers)
    assert res.status_code == 200
    assert res.json()["check_out"] is not None

    # 5. Duplicate check-out fails
    res = client.post("/attendance/check-out", headers=employee_headers)
    assert res.status_code == 409
    assert "Already checked out today" in res.json()["detail"]


def test_check_out_before_check_in_fails(client, employee_headers):
    res = client.post("/attendance/check-out", headers=employee_headers)
    assert res.status_code == 409
    assert "Check in before checking out" in res.json()["detail"]


def test_admin_view_attendance(client, admin_headers, employee_headers):
    # Employee checks in
    client.post("/attendance/check-in", headers=employee_headers)

    # Admin lists attendance
    res = client.get("/attendance", headers=admin_headers)
    assert res.status_code == 200
    records = res.json()
    assert len(records) >= 1
    assert any(r["employee_id"] == "EMP999" for r in records)
