"use client";

import Link from "next/link";

import {
  Alert,
  Avatar,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
  attendanceTone,
} from "@/components/ui";
import {
  ATTENDANCE_LABEL,
  LEAVE_TYPE_LABEL,
  formatDate,
  formatDateRange,
  formatTime,
} from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type {
  AnalyticsSummary,
  AttendanceRow,
  EmployeeListItem,
  LeaveRow,
} from "@/lib/types";

export default function AdminDashboard() {
  const summary = useApi<AnalyticsSummary>("/analytics/summary");
  const pending = useApi<LeaveRow[]>("/leave?status=pending");
  const attendance = useApi<AttendanceRow[]>("/attendance");
  const employees = useApi<EmployeeListItem[]>("/employees");

  const stats = summary.data;
  const queue = pending.data ?? [];
  const todayRows = attendance.data ?? [];
  const staff = (employees.data ?? []).filter((e) => e.role === "employee");

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={formatDate(new Date().toISOString().slice(0, 10), "long")}
      />

      {summary.error ? <Alert>{summary.error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Employees"
          value={summary.loading ? <Spinner /> : (stats?.total_employees ?? 0)}
          hint="On the payroll"
        />
        <StatCard
          label="Present today"
          value={summary.loading ? <Spinner /> : (stats?.present_today ?? 0)}
          hint="Checked in"
          tone="emerald"
        />
        <StatCard
          label="On leave today"
          value={summary.loading ? <Spinner /> : (stats?.on_leave_today ?? 0)}
          hint="Approved and in range"
          tone="sky"
        />
        <StatCard
          label="Pending approvals"
          value={summary.loading ? <Spinner /> : (stats?.pending_leave_requests ?? 0)}
          hint="Waiting on you"
          tone={(stats?.pending_leave_requests ?? 0) > 0 ? "amber" : "slate"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <Card>
          <CardHeader
            title="Pending leave approvals"
            subtitle="Oldest requests need you most"
            action={
              <Link
                href="/admin/leave"
                className="text-sm font-medium text-accent-600 hover:text-accent-700"
              >
                Open queue →
              </Link>
            }
          />
          {pending.error ? (
            <div className="p-5">
              <Alert>{pending.error}</Alert>
            </div>
          ) : pending.loading ? (
            <div className="p-5">
              <Spinner />
            </div>
          ) : queue.length === 0 ? (
            <EmptyState title="Queue is clear" hint="No leave requests are waiting for a decision." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {queue.slice(0, 5).map((request) => (
                <li key={request.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={request.full_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {request.full_name}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {LEAVE_TYPE_LABEL[request.leave_type]} ·{" "}
                      {formatDateRange(request.start_date, request.end_date)}
                    </p>
                  </div>
                  <Badge tone="amber">{request.days}d</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Today's attendance"
            subtitle="Who has clocked in"
            action={
              <Link
                href="/admin/attendance"
                className="text-sm font-medium text-accent-600 hover:text-accent-700"
              >
                Full table →
              </Link>
            }
          />
          {attendance.error ? (
            <div className="p-5">
              <Alert>{attendance.error}</Alert>
            </div>
          ) : attendance.loading ? (
            <div className="p-5">
              <Spinner />
            </div>
          ) : todayRows.length === 0 ? (
            <EmptyState title="Nobody has checked in yet" hint="Records appear as the team clocks in." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {todayRows.slice(0, 5).map((row) => (
                <li key={row.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={row.full_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{row.full_name}</p>
                    <p className="text-sm text-slate-500 tabular-nums">
                      {formatTime(row.check_in)}
                      {row.check_out ? ` – ${formatTime(row.check_out)}` : " · still in"}
                    </p>
                  </div>
                  <Badge tone={attendanceTone(row.status)}>{ATTENDANCE_LABEL[row.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Team"
          subtitle="Open anyone to edit their profile or payroll"
          action={
            <Link
              href="/admin/employees"
              className="text-sm font-medium text-accent-600 hover:text-accent-700"
            >
              All employees →
            </Link>
          }
        />
        {employees.loading ? (
          <div className="p-5">
            <Spinner />
          </div>
        ) : (
          <ul className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((employee) => (
              <li key={employee.id} className="bg-white">
                <Link
                  href={`/admin/employees/${employee.id}`}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"
                >
                  <Avatar name={employee.full_name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {employee.full_name}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {employee.job_title ?? employee.employee_id}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
