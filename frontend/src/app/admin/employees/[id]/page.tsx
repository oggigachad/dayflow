"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { AdminProfileForm, AdminSalaryForm } from "@/components/admin-forms";
import {
  Alert,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Spinner,
  Table,
  TableWrap,
  Td,
  Th,
  attendanceTone,
} from "@/components/ui";
import { ATTENDANCE_LABEL, formatDate, formatTime, formatWorked } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { AttendanceRecord, Salary, User } from "@/lib/types";

export default function AdminEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();

  const employee = useApi<User>(`/employees/${id}`);
  const salary = useApi<Salary>(`/payroll/${id}`);
  const attendance = useApi<AttendanceRecord[]>(`/attendance/${id}?range=month`);

  if (employee.loading) {
    return (
      <>
        <PageHeader title="Employee" />
        <Spinner />
      </>
    );
  }

  if (employee.error || !employee.data) {
    return (
      <>
        <PageHeader title="Employee" />
        <Alert>{employee.error ?? "Employee not found."}</Alert>
        <Link href="/admin/employees" className="text-sm font-medium text-accent-600">
          ← Back to employees
        </Link>
      </>
    );
  }

  const person = employee.data;
  const profile = person.profile;
  const name = profile?.full_name ?? person.email;
  const records = attendance.data ?? [];

  return (
    <>
      <Link
        href="/admin/employees"
        className="text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        ← Employees
      </Link>

      <PageHeader
        title={name}
        subtitle={`${person.employee_id} · ${person.email}`}
        action={
          <Badge tone={person.role === "admin" ? "sky" : "slate"}>
            {person.role === "admin" ? "Admin" : "Employee"}
          </Badge>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <Card>
          <CardHeader title="Profile" subtitle="Admins may edit every field" />
          {profile ? (
            // key: re-seed the form if the server copy changes under us.
            <AdminProfileForm
              key={`${profile.full_name}|${profile.job_title}|${profile.department}|${profile.date_joined}`}
              userId={id}
              initial={profile}
              onSaved={employee.reload}
            />
          ) : (
            <EmptyState title="No profile on file" />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Salary structure"
            subtitle="Annual figures. The employee sees this read-only."
          />
          {salary.error ? (
            <div className="p-5">
              <Alert>{salary.error}</Alert>
            </div>
          ) : salary.loading ? (
            <div className="p-5">
              <Spinner />
            </div>
          ) : salary.data ? (
            <AdminSalaryForm
              key={`${salary.data.base_salary}|${salary.data.effective_date}`}
              userId={id}
              initial={salary.data}
              onSaved={salary.reload}
            />
          ) : (
            <EmptyState title="No salary structure on file" />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Attendance" subtitle="Last 30 days" />
        {attendance.error ? (
          <div className="p-5">
            <Alert>{attendance.error}</Alert>
          </div>
        ) : attendance.loading ? (
          <div className="p-5">
            <Spinner />
          </div>
        ) : records.length === 0 ? (
          <EmptyState title="No attendance in the last 30 days" />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th>Check in</Th>
                  <Th>Check out</Th>
                  <Th className="text-right">Worked</Th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <Td className="font-medium text-slate-900">{formatDate(record.date)}</Td>
                    <Td>
                      <Badge tone={attendanceTone(record.status)}>
                        {ATTENDANCE_LABEL[record.status]}
                      </Badge>
                    </Td>
                    <Td className="tabular-nums">{formatTime(record.check_in)}</Td>
                    <Td className="tabular-nums">{formatTime(record.check_out)}</Td>
                    <Td className="text-right tabular-nums">
                      {formatWorked(record.check_in, record.check_out)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
