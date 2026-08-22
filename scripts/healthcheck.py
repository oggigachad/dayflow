#!/usr/bin/env python3
"""Dayflow stack health check.

Verifies the whole stack is actually working — database, API, auth, RBAC, the
field-level boundaries, and the full apply-approve demo loop — then writes a
timestamped log. Exits non-zero if anything failed, so it can gate a demo or CI.

    python3 scripts/healthcheck.py                # full run, cleans up after itself
    python3 scripts/healthcheck.py --read-only    # no writes to the database
    python3 scripts/healthcheck.py --build        # also typecheck/lint/build the frontend
    python3 scripts/healthcheck.py --selftest     # prove the harness detects failures

Stdlib only, and 3.9-compatible, so it runs with the system python3 without
installing anything.

Design notes:
  - A check that cannot run is SKIP, not PASS. Silence must never look healthy.
  - The demo-loop checks create a throwaway user and delete it in a finally
    block, so a run does not pollute the seeded demo data.
  - The frontend probe confirms the page is *Dayflow* before trusting the port.
    Port 3000 is often another project, and a 200 from it would be a false pass.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional, Tuple

REPO = Path(__file__).resolve().parent.parent
LOG_DIR = REPO / "logs"

API = "http://localhost:8000"
WEB_PORTS = (3000, 3001)
# The frontend must prove it is Dayflow: another project on 3000 would 200 too.
WEB_MARKERS = ("Dayflow", "Demo accounts")

DB = "dayflow"
TABLES = ("users", "profiles", "salary_structures", "attendance", "leave_requests", "audit_log")

ADMIN = "priya.nair@dayflow.in"
EMPLOYEE = "meera.iyer@dayflow.in"
PASSWORD = "dayflow123"

ADMIN_ONLY_ROUTES = (
    "/employees",
    "/attendance",
    "/analytics/summary",
    "/leave",
    "/profile/1",
    "/payroll/1",
    "/audit",
)

WEB_ROUTES = (
    "/",
    "/login",
    "/signup",
    "/employee/dashboard",
    "/employee/attendance",
    "/employee/leave",
    "/employee/payroll",
    "/employee/profile",
    "/admin/dashboard",
    "/admin/employees",
    "/admin/attendance",
    "/admin/leave",
)

PASS, FAIL, SKIP = "PASS", "FAIL", "SKIP"


class Report:
    """Collects results, prints a live line per check, writes the log."""

    def __init__(self) -> None:
        self.rows: list = []
        self.lines: list = []

    def note(self, text: str) -> None:
        """Detail that only goes to the log file."""
        self.lines.append(f"      {text}")

    def record(self, group: str, name: str, state: str, detail: str = "") -> bool:
        self.rows.append({"group": group, "name": name, "state": state, "detail": detail})
        icon = {PASS: "✓", FAIL: "✗", SKIP: "–"}[state]
        line = f"  {icon} {name}" + (f" — {detail}" if detail else "")
        print(line, flush=True)
        self.lines.append(f"[{state}] {group} / {name}" + (f" — {detail}" if detail else ""))
        return state == PASS

    def expect(self, group: str, name: str, got: Any, want: Any, extra: str = "") -> bool:
        """Record a comparison. The failure detail always shows got vs want."""
        ok = got == want
        detail = extra if ok else f"expected {want!r}, got {got!r}" + (f" ({extra})" if extra else "")
        return self.record(group, name, PASS if ok else FAIL, detail)

    def group_header(self, title: str) -> None:
        print(f"\n{title}", flush=True)
        self.lines.append(f"\n=== {title} ===")

    @property
    def counts(self):
        return (
            sum(1 for r in self.rows if r["state"] == PASS),
            sum(1 for r in self.rows if r["state"] == FAIL),
            sum(1 for r in self.rows if r["state"] == SKIP),
        )

    def write_log(self, argv: str) -> Path:
        LOG_DIR.mkdir(exist_ok=True)
        stamp = datetime.now(timezone.utc).astimezone()
        passed, failed, skipped = self.counts
        verdict = "FAILED" if failed else ("DEGRADED" if skipped else "HEALTHY")

        header = [
            "Dayflow health check",
            f"when:    {stamp.isoformat(timespec='seconds')}",
            f"command: {argv}",
            f"verdict: {verdict}  ({passed} passed, {failed} failed, {skipped} skipped)",
            "",
        ]

        body = list(self.lines)
        if failed:
            body += ["", "=== failures ==="]
            body += [
                f"  {r['group']} / {r['name']}: {r['detail'] or 'no detail'}"
                for r in self.rows
                if r["state"] == FAIL
            ]
        if skipped:
            body += ["", "=== skipped (could not verify — not the same as healthy) ==="]
            body += [
                f"  {r['group']} / {r['name']}: {r['detail'] or 'no reason given'}"
                for r in self.rows
                if r["state"] == SKIP
            ]

        text = "\n".join(header + body) + "\n"
        path = LOG_DIR / f"healthcheck-{stamp.strftime('%Y%m%d-%H%M%S')}.log"
        path.write_text(text, encoding="utf-8")
        # Stable filename so `tail -f logs/healthcheck-latest.log` always works.
        (LOG_DIR / "healthcheck-latest.log").write_text(text, encoding="utf-8")
        return path


# --- transport -----------------------------------------------------------


def http(
    method: str,
    url: str,
    token: Optional[str] = None,
    body: Optional[dict] = None,
    timeout: float = 10.0,
) -> Tuple[Optional[int], Any]:
    """Return (status, parsed_body). status is None when the host is unreachable."""
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url, data=data, method=method)
    request.add_header("Content-Type", "application/json")
    if token:
        request.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", "replace")
            try:
                return response.status, json.loads(raw)
            except json.JSONDecodeError:
                return response.status, raw
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", "replace")
        try:
            return error.code, json.loads(raw)
        except json.JSONDecodeError:
            return error.code, raw
    except (urllib.error.URLError, OSError, TimeoutError) as error:
        return None, str(error)


def psql(sql: str) -> Tuple[bool, str]:
    try:
        done = subprocess.run(
            ["psql", "-d", DB, "-tAqc", sql],
            capture_output=True,
            text=True,
            timeout=15,
        )
    except FileNotFoundError:
        return False, "psql not on PATH"
    except subprocess.TimeoutExpired:
        return False, "psql timed out"
    if done.returncode != 0:
        return False, (done.stderr or done.stdout).strip().splitlines()[-1:][0] if (done.stderr or done.stdout).strip() else "psql failed"
    return True, done.stdout.strip()


def login(email: str) -> Tuple[Optional[str], str]:
    status, body = http("POST", f"{API}/auth/login", body={"email": email, "password": PASSWORD})
    if status != 200 or not isinstance(body, dict):
        return None, f"login returned {status}: {body}"
    return body.get("access_token"), ""


# --- checks --------------------------------------------------------------


def check_database(report: Report) -> None:
    report.group_header("Database")

    ok, out = psql("select 1")
    if not report.record("database", "postgres reachable", PASS if ok else FAIL, "" if ok else out):
        report.record("database", "schema present", SKIP, "postgres unreachable")
        report.record("database", "seed data present", SKIP, "postgres unreachable")
        return

    ok, out = psql(
        "select string_agg(tablename, ',' order by tablename) from pg_tables where schemaname='public'"
    )
    found = set(out.split(",")) if ok and out else set()
    missing = [t for t in TABLES if t not in found]
    report.record(
        "database",
        "schema present",
        PASS if not missing else FAIL,
        f"{len(TABLES)} tables" if not missing else f"missing: {', '.join(missing)}",
    )

    ok, out = psql("select count(*) from users")
    users = int(out) if ok and out.isdigit() else 0
    report.record(
        "database",
        "seed data present",
        PASS if users > 0 else FAIL,
        f"{users} users" if users else "no users — run: uv run python -m app.seed",
    )
    report.note(f"user count = {users}")


def check_api(report: Report) -> bool:
    report.group_header("API")
    status, body = http("GET", f"{API}/health")
    if status is None:
        report.record(
            "api", "reachable", FAIL, f"{API} unreachable ({body}) — is uvicorn running?"
        )
        return False
    return report.expect("api", "reachable", (status, body), (200, {"status": "ok"}))


def check_auth(report: Report) -> dict:
    report.group_header("Authentication")
    tokens: dict = {}

    for label, email in (("admin", ADMIN), ("employee", EMPLOYEE)):
        token, error = login(email)
        if report.record(
            "auth", f"login as {label}", PASS if token else FAIL, error or email
        ):
            tokens[label] = token

    if "employee" in tokens:
        status, body = http("GET", f"{API}/auth/me", token=tokens["employee"])
        report.expect("auth", "/auth/me returns the caller", status, 200)
        if isinstance(body, dict):
            report.expect("auth", "/auth/me identity matches", body.get("email"), EMPLOYEE)
            report.note(f"me = {body.get('employee_id')} {body.get('role')}")
    else:
        report.record("auth", "/auth/me returns the caller", SKIP, "no employee token")
        report.record("auth", "/auth/me identity matches", SKIP, "no employee token")

    status, _ = http(
        "POST", f"{API}/auth/login", body={"email": EMPLOYEE, "password": "wrong-password-1"}
    )
    report.expect("auth", "wrong password rejected", status, 401)

    status, _ = http("GET", f"{API}/auth/me")
    report.expect("auth", "no token rejected", status, 401)

    status, _ = http("GET", f"{API}/auth/me", token="not.a.real.token")
    report.expect("auth", "garbage token rejected", status, 401)

    # Token-type confusion, both directions. This is the pair most likely to
    # regress silently if someone touches security.py.
    status, pair = http(
        "POST", f"{API}/auth/login", body={"email": EMPLOYEE, "password": PASSWORD}
    )
    if status == 200 and isinstance(pair, dict):
        status, _ = http("GET", f"{API}/auth/me", token=pair["refresh_token"])
        report.expect("auth", "refresh token rejected as bearer", status, 401)

        status, _ = http(
            "POST", f"{API}/auth/refresh", body={"refresh_token": pair["access_token"]}
        )
        report.expect("auth", "access token rejected at /refresh", status, 401)

        status, _ = http(
            "POST", f"{API}/auth/refresh", body={"refresh_token": pair["refresh_token"]}
        )
        report.expect("auth", "refresh issues a new pair", status, 200)
    else:
        for name in (
            "refresh token rejected as bearer",
            "access token rejected at /refresh",
            "refresh issues a new pair",
        ):
            report.record("auth", name, SKIP, "could not obtain a token pair")

    return tokens


def check_rbac(report: Report, tokens: dict) -> None:
    report.group_header("Access control")

    employee = tokens.get("employee")
    if not employee:
        for route in ADMIN_ONLY_ROUTES:
            report.record("rbac", f"employee blocked from GET {route}", SKIP, "no employee token")
        return

    for route in ADMIN_ONLY_ROUTES:
        status, _ = http("GET", f"{API}{route}", token=employee)
        report.expect("rbac", f"employee blocked from GET {route}", status, 403)

    status, _ = http(
        "PUT", f"{API}/profile/1", token=employee, body={"job_title": "CEO"}
    )
    report.expect("rbac", "employee blocked from PUT /profile/1", status, 403)

    status, _ = http(
        "PUT", f"{API}/payroll/1", token=employee, body={"base_salary": 99_999_999}
    )
    report.expect("rbac", "employee blocked from PUT /payroll/1", status, 403)

    admin = tokens.get("admin")
    if not admin:
        report.record("rbac", "admin allowed on admin routes", SKIP, "no admin token")
        return
    bad = [
        route
        for route in ADMIN_ONLY_ROUTES
        if http("GET", f"{API}{route}", token=admin)[0] not in (200, 404)
    ]
    report.record(
        "rbac",
        "admin allowed on admin routes",
        PASS if not bad else FAIL,
        f"{len(ADMIN_ONLY_ROUTES)} routes" if not bad else f"refused: {', '.join(bad)}",
    )


def check_boundaries(report: Report, tokens: dict) -> None:
    report.group_header("Field boundaries")

    employee = tokens.get("employee")
    if not employee:
        for name in (
            "employee cannot set own job_title",
            "employee cannot set own department",
            "employee can set own phone",
            "no PUT /payroll/me exists",
        ):
            report.record("boundaries", name, SKIP, "no employee token")
        return

    for field, value in (("job_title", "CEO"), ("department", "Board")):
        status, _ = http("PUT", f"{API}/profile/me", token=employee, body={field: value})
        report.expect("boundaries", f"employee cannot set own {field}", status, 422)

    # Read the current value so the check restores it instead of overwriting.
    status, current = http("GET", f"{API}/profile/me", token=employee)
    phone = current.get("phone") if isinstance(current, dict) else None
    status, _ = http("PUT", f"{API}/profile/me", token=employee, body={"phone": phone})
    report.expect("boundaries", "employee can set own phone", status, 200, "value preserved")

    status, _ = http("PUT", f"{API}/payroll/me", token=employee, body={"base_salary": 1})
    report.expect(
        "boundaries", "no PUT /payroll/me exists", status, 405, "read-only by construction"
    )


def check_reads(report: Report, tokens: dict) -> None:
    report.group_header("Read endpoints")

    employee, admin = tokens.get("employee"), tokens.get("admin")
    employee_routes = (
        "/profile/me",
        "/payroll/me",
        "/attendance/today",
        "/attendance/me?range=week",
        "/attendance/me?range=month",
        "/leave/me",
    )
    admin_routes = ("/employees", "/attendance", "/leave", "/leave?status=pending", "/analytics/summary")

    for token, routes, who in ((employee, employee_routes, "employee"), (admin, admin_routes, "admin")):
        for route in routes:
            if not token:
                report.record("reads", f"GET {route}", SKIP, f"no {who} token")
                continue
            status, body = http("GET", f"{API}{route}", token=token)
            report.expect("reads", f"GET {route}", status, 200)
            if route == "/analytics/summary" and isinstance(body, dict):
                report.note(f"analytics = {body}")

    if admin:
        status, body = http("GET", f"{API}/analytics/summary", token=admin)
        if isinstance(body, dict):
            expected_keys = {
                "total_employees",
                "present_today",
                "on_leave_today",
                "pending_leave_requests",
            }
            missing = expected_keys - set(body)
            report.record(
                "reads",
                "analytics returns all four counts",
                PASS if not missing else FAIL,
                "" if not missing else f"missing: {', '.join(sorted(missing))}",
            )
            numeric = all(isinstance(body.get(k), int) for k in expected_keys - missing)
            report.record(
                "reads",
                "analytics counts are numbers",
                PASS if numeric else FAIL,
                "" if numeric else f"non-numeric in {body}",
            )


def check_demo_loop(report: Report, tokens: dict) -> None:
    """The apply -> approve -> employee-sees-it loop, on a throwaway user."""
    report.group_header("Demo loop (throwaway user)")

    admin = tokens.get("admin")
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    # Strictly alphanumeric, so embedding it in the cleanup SQL is safe.
    email = f"healthcheck{stamp}@dayflow.in"
    employee_id = f"HC{stamp}"
    names = (
        "signup creates an account",
        "check-in succeeds",
        "double check-in refused",
        "check-out succeeds",
        "double check-out refused",
        "leave application accepted",
        "backwards date range refused",
        "request appears in admin queue",
        "admin approval accepted",
        "re-deciding refused",
        "employee sees the decision",
    )

    if not admin:
        for name in names:
            report.record("demo", name, SKIP, "no admin token")
        return

    created = False
    try:
        status, body = http(
            "POST",
            f"{API}/auth/signup",
            body={
                "employee_id": employee_id,
                "email": email,
                "password": PASSWORD,
                "full_name": "Health Check",
                "role": "employee",
            },
        )
        if not report.expect("demo", names[0], status, 201, email):
            for name in names[1:]:
                report.record("demo", name, SKIP, "signup failed")
            return
        created = True
        token = body["access_token"]
        report.note(f"throwaway user {email} created")

        status, _ = http("POST", f"{API}/attendance/check-in", token=token)
        report.expect("demo", names[1], status, 201)

        status, _ = http("POST", f"{API}/attendance/check-in", token=token)
        report.expect("demo", names[2], status, 409, "one record per day")

        status, _ = http("POST", f"{API}/attendance/check-out", token=token)
        report.expect("demo", names[3], status, 200)

        status, _ = http("POST", f"{API}/attendance/check-out", token=token)
        report.expect("demo", names[4], status, 409)

        status, leave = http(
            "POST",
            f"{API}/leave",
            token=token,
            body={
                "leave_type": "paid",
                "start_date": "2099-01-10",
                "end_date": "2099-01-12",
                "remarks": "automated health check",
            },
        )
        if not report.expect("demo", names[5], status, 201):
            for name in names[6:]:
                report.record("demo", name, SKIP, "leave application failed")
            return
        leave_id = leave["id"]
        report.expect("demo", names[5] + " (3 days computed)", leave.get("days"), 3)

        status, _ = http(
            "POST",
            f"{API}/leave",
            token=token,
            body={"leave_type": "paid", "start_date": "2099-02-10", "end_date": "2099-02-01"},
        )
        report.expect("demo", names[6], status, 422)

        status, queue = http("GET", f"{API}/leave?status=pending", token=admin)
        in_queue = isinstance(queue, list) and any(r.get("id") == leave_id for r in queue)
        report.record(
            "demo",
            names[7],
            PASS if in_queue else FAIL,
            "" if in_queue else f"id {leave_id} absent from {len(queue) if isinstance(queue, list) else '?'} pending",
        )

        note = "Approved by the health check."
        status, _ = http(
            "PATCH",
            f"{API}/leave/{leave_id}",
            token=admin,
            body={"status": "approved", "admin_comment": note},
        )
        report.expect("demo", names[8], status, 200)

        status, _ = http(
            "PATCH", f"{API}/leave/{leave_id}", token=admin, body={"status": "rejected"}
        )
        report.expect("demo", names[9], status, 409, "decisions are final")

        # The payoff: the employee must see both the new status and the note.
        status, mine = http("GET", f"{API}/leave/me", token=token)
        row = next(
            (r for r in mine if r.get("id") == leave_id) if isinstance(mine, list) else [], None
        )
        if row is None:
            report.record("demo", names[10], FAIL, "request missing from /leave/me")
        else:
            report.expect(
                "demo",
                names[10],
                (row.get("status"), row.get("admin_comment")),
                ("approved", note),
            )
    except (KeyError, TypeError) as error:
        report.record("demo", "loop completed", FAIL, f"unexpected response shape: {error!r}")
    finally:
        if created:
            ok, out = psql(f"delete from users where email = '{email}'")
            report.record(
                "demo",
                "throwaway user cleaned up",
                PASS if ok else FAIL,
                "" if ok else f"{out} — remove {email} by hand",
            )


def find_web(report: Report) -> Optional[str]:
    """Locate the Dayflow frontend, confirming identity rather than trusting a 200."""
    for port in WEB_PORTS:
        base = f"http://localhost:{port}"
        status, body = http("GET", f"{base}/login", timeout=8)
        if status != 200:
            continue
        text = body if isinstance(body, str) else json.dumps(body)
        if all(marker in text for marker in WEB_MARKERS):
            report.record("web", "frontend found", PASS, base)
            return base
        report.note(f"{base} answered 200 but is not Dayflow — ignoring")
    report.record(
        "web",
        "frontend found",
        SKIP,
        f"nothing Dayflow-shaped on ports {', '.join(map(str, WEB_PORTS))} — is `npm run dev` running?",
    )
    return None


def check_web(report: Report) -> None:
    report.group_header("Frontend")
    base = find_web(report)
    if base is None:
        for route in WEB_ROUTES:
            report.record("web", f"GET {route}", SKIP, "frontend not running")
        return

    for route in WEB_ROUTES:
        status, _ = http("GET", f"{base}{route}", timeout=20)
        report.expect("web", f"GET {route}", status, 200)

    status, _ = http("GET", f"{base}/definitely-not-a-route", timeout=20)
    report.expect("web", "unknown route 404s", status, 404)


def check_build(report: Report) -> None:
    report.group_header("Build (--build)")
    steps = (
        ("backend self-check", ["uv", "run", "python", "-m", "app.security"], REPO / "backend"),
        ("frontend typecheck", ["npx", "tsc", "--noEmit"], REPO / "frontend"),
        ("frontend lint", ["npx", "eslint", "src", "--max-warnings=0"], REPO / "frontend"),
        ("frontend build", ["npm", "run", "build"], REPO / "frontend"),
    )
    for name, command, cwd in steps:
        if not cwd.is_dir():
            report.record("build", name, SKIP, f"{cwd.name}/ not found")
            continue
        try:
            done = subprocess.run(
                command, cwd=str(cwd), capture_output=True, text=True, timeout=600
            )
        except FileNotFoundError:
            report.record("build", name, SKIP, f"{command[0]} not on PATH")
            continue
        except subprocess.TimeoutExpired:
            report.record("build", name, FAIL, "timed out after 600s")
            continue

        output = (done.stdout + done.stderr).strip()
        report.record(
            "build",
            name,
            PASS if done.returncode == 0 else FAIL,
            "" if done.returncode == 0 else f"exit {done.returncode}",
        )
        if done.returncode != 0:
            for line in output.splitlines()[-25:]:
                report.note(line)


def check_selftest(report: Report) -> None:
    """Prove the harness reports failures instead of quietly passing.

    A health check nobody has seen fail is not evidence of health. These two
    checks are wrong on purpose: the run must end FAILED.
    """
    report.group_header("Self-test (--selftest) — these MUST fail")
    status, _ = http("GET", f"{API}/definitely-not-a-real-endpoint")
    report.expect("selftest", "deliberately wrong expectation", status, 200)
    report.expect("selftest", "deliberately false comparison", 1 + 1, 3)


# --- entry point ---------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify the Dayflow stack is working.")
    parser.add_argument(
        "--read-only", action="store_true", help="skip the demo loop (writes nothing)"
    )
    parser.add_argument(
        "--build", action="store_true", help="also typecheck, lint and build the frontend"
    )
    parser.add_argument(
        "--selftest",
        action="store_true",
        help="add two deliberately failing checks to prove detection works",
    )
    parser.add_argument("--skip-web", action="store_true", help="skip the frontend probe")
    args = parser.parse_args()

    report = Report()
    print("Dayflow health check")

    check_database(report)

    if check_api(report):
        tokens = check_auth(report)
        check_rbac(report, tokens)
        check_boundaries(report, tokens)
        check_reads(report, tokens)
        if args.read_only:
            report.group_header("Demo loop")
            report.record("demo", "apply/approve loop", SKIP, "--read-only")
        else:
            check_demo_loop(report, tokens)
    else:
        report.group_header("Skipped because the API is down")
        for group, name in (
            ("auth", "authentication suite"),
            ("rbac", "access-control suite"),
            ("boundaries", "field-boundary suite"),
            ("reads", "read-endpoint suite"),
            ("demo", "apply/approve loop"),
        ):
            report.record(group, name, SKIP, "API unreachable")

    if args.skip_web:
        report.group_header("Frontend")
        report.record("web", "frontend suite", SKIP, "--skip-web")
    else:
        check_web(report)

    if args.build:
        check_build(report)
    if args.selftest:
        check_selftest(report)

    passed, failed, skipped = report.counts
    verdict = "FAILED" if failed else ("DEGRADED" if skipped else "HEALTHY")
    log_path = report.write_log(" ".join(sys.argv))

    print(f"\n{verdict}: {passed} passed, {failed} failed, {skipped} skipped")
    if failed:
        print("\nFailures:")
        for row in report.rows:
            if row["state"] == FAIL:
                print(f"  ✗ {row['group']} / {row['name']}: {row['detail'] or 'no detail'}")
    if skipped:
        print(f"\n{skipped} check(s) could not run — skipped is not the same as healthy.")
    print(f"\nLog: {log_path.relative_to(REPO)}")
    print(f"     {(LOG_DIR / 'healthcheck-latest.log').relative_to(REPO)}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
