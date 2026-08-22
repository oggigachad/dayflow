"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { KeyValueEditor } from "@/components/key-value-editor";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Spinner,
  Table,
  TableWrap,
  Td,
  Th,
  attendanceTone,
} from "@/components/ui";
import { put } from "@/lib/api";
import {
  ATTENDANCE_LABEL,
  formatDate,
  formatTime,
  formatWorked,
  money,
} from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { AttendanceRecord, Profile, Salary, User } from "@/lib/types";

const EMPTY_PROFILE = {
  full_name: "",
  phone: "",
  address: "",
  profile_picture_url: "",
  job_title: "",
  department: "",
  date_joined: "",
};

export default function AdminEmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const employee = useApi<User>(`/employees/${id}`);
  const salary = useApi<Salary>(`/payroll/${id}`);
  const attendance = useApi<AttendanceRecord[]>(`/attendance/${id}?range=month`);

  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);
  const [salaryForm, setSalaryForm] = useState<{
    base_salary: number;
    allowances: Record<string, number>;
    deductions: Record<string, number>;
    effective_date: string;
  }>({ base_salary: 0, allowances: {}, deductions: {}, effective_date: "" });

  const [profileState, setProfileState] = useState<{ error?: string; notice?: string; busy: boolean }>({ busy: false });
  const [salaryState, setSalaryState] = useState<{ error?: string; notice?: string; busy: boolean }>({ busy: false });

  useEffect(() => {
    const profile = employee.data?.profile;
    if (!profile) return;
    setProfileForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      profile_picture_url: profile.profile_picture_url ?? "",
      job_title: profile.job_title ?? "",
      department: profile.department ?? "",
      date_joined: profile.date_joined ?? "",
    });
  }, [employee.data]);

  useEffect(() => {
    if (!salary.data) return;
    setSalaryForm({
      base_salary: salary.data.base_salary,
      allowances: { ...salary.data.allowances },
      deductions: { ...salary.data.deductions },
      effective_date: salary.data.effective_date ?? "",
    });
  }, [salary.data]);

  const setProfileField = (key: keyof typeof profileForm) => (event: { target: { value: string } }) =>
    setProfileForm((previous) => ({ ...previous, [key]: event.target.value }));

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setProfileState({ busy: true });
    try {
      // Blank means "cleared" for optional text; full_name is required so it is
      // sent as-is and the server rejects an empty one.
      const blankToNull = (value: string) => value.trim() || null;
      await put<Profile>(`/profile/${id}`, {
        full_name: profileForm.full_name.trim(),
        phone: blankToNull(profileForm.phone),
        address: blankToNull(profileForm.address),
        profile_picture_url: blankToNull(profileForm.profile_picture_url),
        job_title: blankToNull(profileForm.job_title),
        department: blankToNull(profileForm.department),
        date_joined: profileForm.date_joined || null,
      });
      setProfileState({ busy: false, notice: "Profile saved." });
      employee.reload();
    } catch (cause) {
      setProfileState({
        busy: false,
        error: cause instanceof Error ? cause.message : "Could not save the profile",
      });
    }
  }

  async function saveSalary(event: React.FormEvent) {
    event.preventDefault();
    setSalaryState({ busy: true });
    try {
      await put<Salary>(`/payroll/${id}`, {
        base_salary: salaryForm.base_salary,
        allowances: salaryForm.allowances,
        deductions: salaryForm.deductions,
        effective_date: salaryForm.effective_date || null,
      });
      setSalaryState({ busy: false, notice: "Salary structure saved." });
      salary.reload();
    } catch (cause) {
      setSalaryState({
        busy: false,
        error: cause instanceof Error ? cause.message : "Could not save the structure",
      });
    }
  }

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
  const name = person.profile?.full_name ?? person.email;
  const previewGross =
    salaryForm.base_salary + Object.values(salaryForm.allowances).reduce((a, b) => a + b, 0);
  const previewNet =
    previewGross - Object.values(salaryForm.deductions).reduce((a, b) => a + b, 0);
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
          <form onSubmit={saveProfile} className="space-y-4 p-5" noValidate>
            {profileState.error ? <Alert>{profileState.error}</Alert> : null}
            {profileState.notice ? <Alert tone="success">{profileState.notice}</Alert> : null}

            <div className="flex items-center gap-3">
              <Avatar name={profileForm.full_name || name} size="lg" />
              <div className="flex-1">
                <Field label="Full name">
                  <Input required value={profileForm.full_name} onChange={setProfileField("full_name")} />
                </Field>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job title">
                <Input value={profileForm.job_title} onChange={setProfileField("job_title")} />
              </Field>
              <Field label="Department">
                <Input value={profileForm.department} onChange={setProfileField("department")} />
              </Field>
              <Field label="Phone">
                <Input type="tel" value={profileForm.phone} onChange={setProfileField("phone")} />
              </Field>
              <Field label="Date joined">
                <Input
                  type="date"
                  value={profileForm.date_joined}
                  onChange={setProfileField("date_joined")}
                />
              </Field>
            </div>

            <Field label="Address">
              <Input value={profileForm.address} onChange={setProfileField("address")} />
            </Field>

            <Field label="Profile picture URL">
              <Input
                type="url"
                value={profileForm.profile_picture_url}
                onChange={setProfileField("profile_picture_url")}
              />
            </Field>

            <Button type="submit" loading={profileState.busy}>
              Save profile
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader
            title="Salary structure"
            subtitle="Annual figures. The employee sees this read-only."
          />
          <form onSubmit={saveSalary} className="space-y-5 p-5" noValidate>
            {salary.error ? <Alert>{salary.error}</Alert> : null}
            {salaryState.error ? <Alert>{salaryState.error}</Alert> : null}
            {salaryState.notice ? <Alert tone="success">{salaryState.notice}</Alert> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Base salary (annual)">
                <Input
                  type="number"
                  min={0}
                  step={10000}
                  value={salaryForm.base_salary}
                  onChange={(event) =>
                    setSalaryForm((previous) => ({
                      ...previous,
                      base_salary: Number(event.target.value) || 0,
                    }))
                  }
                  className="tabular-nums"
                />
              </Field>
              <Field label="Effective from">
                <Input
                  type="date"
                  value={salaryForm.effective_date}
                  onChange={(event) =>
                    setSalaryForm((previous) => ({ ...previous, effective_date: event.target.value }))
                  }
                />
              </Field>
            </div>

            <KeyValueEditor
              legend="Allowances"
              value={salaryForm.allowances}
              onChange={(allowances) => setSalaryForm((previous) => ({ ...previous, allowances }))}
            />

            <KeyValueEditor
              legend="Deductions"
              value={salaryForm.deductions}
              onChange={(deductions) => setSalaryForm((previous) => ({ ...previous, deductions }))}
            />

            {/* Live preview so the admin sees the effect before saving. */}
            <dl className="rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex justify-between py-1">
                <dt className="text-slate-500">Gross</dt>
                <dd className="font-medium tabular-nums text-slate-900">{money(previewGross)}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-slate-500">Net</dt>
                <dd className="font-medium tabular-nums text-slate-900">{money(previewNet)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 py-1 pt-2">
                <dt className="text-slate-500">Monthly take-home</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {money(Math.round(previewNet / 12))}
                </dd>
              </div>
            </dl>

            <Button type="submit" loading={salaryState.busy}>
              Save structure
            </Button>
          </form>
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
