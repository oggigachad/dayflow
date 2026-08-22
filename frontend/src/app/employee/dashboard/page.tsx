"use client";

import Link from "next/link";

import {
  Alert,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
  leaveTone,
} from "@/components/ui";
import { useAuth } from "@/lib/auth";
import {
  ATTENDANCE_LABEL,
  LEAVE_STATUS_LABEL,
  LEAVE_TYPE_LABEL,
  formatDate,
  formatDateRange,
  formatTime,
  formatWorked,
} from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { AttendanceRecord, AttendanceToday, LeaveRequest, Salary } from "@/lib/types";

const QUICK_LINKS = [
  {
    href: "/employee/attendance",
    label: "Attendance",
    hint: "Check in, check out, see your week",
  },
  { href: "/employee/leave", label: "Leave requests", hint: "Apply and track approvals" },
  { href: "/employee/payroll", label: "Payroll", hint: "Your salary breakdown" },
  { href: "/employee/profile", label: "Profile", hint: "Keep your details current" },
];

/** One merged, newest-first feed from attendance and leave. */
type Activity = { key: string; when: string; title: string; meta: string; badge?: React.ReactNode };

function buildActivity(attendance: AttendanceRecord[], leave: LeaveRequest[]): Activity[] {
  const fromAttendance = attendance.map((record) => ({
    key: `a${record.id}`,
    when: record.date,
    title: ATTENDANCE_LABEL[record.status],
    meta:
      record.check_in && record.check_out
        ? `${formatTime(record.check_in)} – ${formatTime(record.check_out)} · ${formatWorked(record.check_in, record.check_out)}`
        : record.check_in
          ? `In at ${formatTime(record.check_in)} · still open`
          : "No hours logged",
  }));

  const fromLeave = leave.map((request) => ({
    key: `l${request.id}`,
    when: request.created_at.slice(0, 10),
    title: `${LEAVE_TYPE_LABEL[request.leave_type]} leave · ${request.days}d`,
    meta: formatDateRange(request.start_date, request.end_date),
    badge: <Badge tone={leaveTone(request.status)}>{LEAVE_STATUS_LABEL[request.status]}</Badge>,
  }));

  return [...fromAttendance, ...fromLeave]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 8);
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const today = useApi<AttendanceToday>("/attendance/today");
  const week = useApi<AttendanceRecord[]>("/attendance/me?range=week");
  const leave = useApi<LeaveRequest[]>("/leave/me");
  const payroll = useApi<Salary>("/payroll/me");

  const firstName = user?.profile?.full_name.split(" ")[0] ?? "there";
  const presentThisWeek = (week.data ?? []).filter((r) => r.status === "present").length;
  const pending = (leave.data ?? []).filter((r) => r.status === "pending").length;
  const activity = buildActivity(week.data ?? [], leave.data ?? []);

  const clockLabel = !today.data
    ? "—"
    : today.data.checked_out
      ? "Done for today"
      : today.data.checked_in
        ? `In at ${formatTime(today.data.record?.check_in ?? null)}`
        : "Not checked in";

  return (
    <>
      <PageHeader
        title={`Good to see you, ${firstName}`}
        subtitle={`${formatDate(new Date().toISOString().slice(0, 10), "long")} · ${user?.profile?.job_title ?? "Team member"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today"
          value={today.loading ? <Spinner /> : clockLabel}
          tone={today.data?.checked_in ? "emerald" : "amber"}
          hint={today.data?.checked_out ? "Checked out" : "Attendance status"}
        />
        <StatCard
          label="Present this week"
          value={week.loading ? <Spinner /> : `${presentThisWeek}d`}
          hint="Last 7 days"
          tone="emerald"
        />
        <StatCard
          label="Pending requests"
          value={leave.loading ? <Spinner /> : pending}
          hint="Awaiting HR"
          tone={pending > 0 ? "amber" : "slate"}
        />
        <StatCard
          label="Monthly net"
          value={
            payroll.loading ? (
              <Spinner />
            ) : payroll.data ? (
              `₹${Math.round(payroll.data.net / 12).toLocaleString("en-IN")}`
            ) : (
              "—"
            )
          }
          hint="Take-home estimate"
          tone="sky"
        />
      </div>

      <nav aria-label="Quick actions">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Card as="li" key={link.href} className="transition-shadow hover:shadow-md">
              <Link href={link.href} className="block h-full p-5">
                <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                <p className="mt-1 text-sm text-slate-500">{link.hint}</p>
                <span aria-hidden className="mt-3 block text-sm font-medium text-accent-600">
                  Open →
                </span>
              </Link>
            </Card>
          ))}
        </ul>
      </nav>

      <Card>
        <CardHeader title="Recent activity" subtitle="Your attendance and leave, newest first" />
        {week.error || leave.error ? (
          <div className="p-5">
            <Alert>{week.error ?? leave.error}</Alert>
          </div>
        ) : week.loading || leave.loading ? (
          <div className="p-5">
            <Spinner />
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            hint="Check in on the Attendance page and it will show up here."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {activity.map((item) => (
              <li key={item.key} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="truncate text-sm text-slate-500">{item.meta}</p>
                </div>
                {item.badge}
                <time className="w-24 shrink-0 text-right text-sm text-slate-400" dateTime={item.when}>
                  {formatDate(item.when)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
