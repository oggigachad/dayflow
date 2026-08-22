from datetime import date, timedelta


def test_leave_workflow_apply_approve_audit(client, employee_headers, admin_headers, db):
    today = date.today()
    start_date = today + timedelta(days=2)
    end_date = today + timedelta(days=5)

    # 1. Apply for leave
    apply_res = client.post(
        "/leave",
        headers=employee_headers,
        json={
            "leave_type": "paid",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "remarks": "Annual vacation trip",
        },
    )
    assert apply_res.status_code == 201
    leave_data = apply_res.json()
    assert leave_data["status"] == "pending"
    assert leave_data["days"] == 4
    leave_id = leave_data["id"]

    # 2. Employee checks my_leave
    my_leaves = client.get("/leave/me", headers=employee_headers).json()
    assert len(my_leaves) >= 1
    assert my_leaves[0]["id"] == leave_id

    # 3. Non-admin attempting to decide leave gets 403 Forbidden
    forbidden_res = client.patch(
        f"/leave/{leave_id}",
        headers=employee_headers,
        json={"status": "approved", "admin_comment": "Self approval attempt"},
    )
    assert forbidden_res.status_code == 403

    # 4. Admin approves leave
    approve_res = client.patch(
        f"/leave/{leave_id}",
        headers=admin_headers,
        json={"status": "approved", "admin_comment": "Approved. Have a great vacation!"},
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"
    assert approve_res.json()["admin_comment"] == "Approved. Have a great vacation!"

    # 5. Re-deciding settled leave returns 409 Conflict
    redecide_res = client.patch(
        f"/leave/{leave_id}",
        headers=admin_headers,
        json={"status": "rejected", "admin_comment": "Trying to reject after approval"},
    )
    assert redecide_res.status_code == 409
    assert "already approved" in redecide_res.json()["detail"]

    # 6. Admin checks audit log
    audit_res = client.get("/audit", headers=admin_headers)
    assert audit_res.status_code == 200
    audit_entries = audit_res.json()
    actions = [entry["action"] for entry in audit_entries]
    assert "leave.apply" in actions
    assert "leave.approved" in actions


def test_invalid_leave_date_range(client, employee_headers):
    today = date.today()
    res = client.post(
        "/leave",
        headers=employee_headers,
        json={
            "leave_type": "sick",
            "start_date": (today + timedelta(days=5)).isoformat(),
            "end_date": (today + timedelta(days=2)).isoformat(),
            "remarks": "End before start",
        },
    )
    assert res.status_code == 422
