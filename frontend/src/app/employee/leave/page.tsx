"use client";

import { useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  leaveTone,
} from "@/components/ui";
import { post } from "@/lib/api";
import {
  LEAVE_STATUS_LABEL,
  LEAVE_TYPE_LABEL,
  formatDate,
  formatDateRange,
} from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { LeaveRequest, LeaveType } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

export default function EmployeeLeavePage() {
  const requests = useApi<LeaveRequest[]>("/leave/me");
  const [form, setForm] = useState({
    leave_type: "paid" as LeaveType,
    start_date: today(),
    end_date: today(),
    remarks: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const rangeInvalid = form.end_date < form.start_date;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await post("/leave", { ...form, remarks: form.remarks.trim() || null });
      setNotice("Request submitted. HR will see it in their approvals queue.");
      setForm((previous) => ({ ...previous, remarks: "" }));
      requests.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit the request");
    } finally {
      setBusy(false);
    }
  }

  const rows = requests.data ?? [];

  return (
    <>
      <PageHeader
        title="Leave"
        subtitle="Apply for time off and track where each request stands."
      />

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
        <Card>
          <CardHeader title="Apply for leave" />
          <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
            {error ? <Alert>{error}</Alert> : null}
            {notice ? <Alert tone="success">{notice}</Alert> : null}

            <Field label="Leave type">
              <Select value={form.leave_type} onChange={set("leave_type")}>
                <option value="paid">Paid leave</option>
                <option value="sick">Sick leave</option>
                <option value="unpaid">Unpaid leave</option>
              </Select>
            </Field>

            <Field label="From">
              <Input type="date" required value={form.start_date} onChange={set("start_date")} />
            </Field>

            <Field
              label="To"
              error={rangeInvalid ? "The end date cannot be before the start date." : undefined}
            >
              <Input
                type="date"
                required
                min={form.start_date}
                value={form.end_date}
                onChange={set("end_date")}
                aria-invalid={rangeInvalid || undefined}
              />
            </Field>

            <Field label="Remarks" hint="Optional, but it speeds up approval.">
              <Textarea
                rows={3}
                maxLength={500}
                value={form.remarks}
                onChange={set("remarks")}
                placeholder="Family wedding in Kochi."
              />
            </Field>

            <Button type="submit" loading={busy} disabled={rangeInvalid} className="w-full">
              Submit request
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Your requests" subtitle="Newest first" />
          {requests.error ? (
            <div className="p-5">
              <Alert>{requests.error}</Alert>
            </div>
          ) : requests.loading ? (
            <div className="p-5">
              <Spinner />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No requests yet"
              hint="Submit one on the left and it will appear here with its status."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((request) => (
                <li key={request.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-medium text-slate-900">
                      {LEAVE_TYPE_LABEL[request.leave_type]} leave
                    </p>
                    <Badge tone={leaveTone(request.status)}>
                      {LEAVE_STATUS_LABEL[request.status]}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {request.days} day{request.days === 1 ? "" : "s"}
                    </span>
                    <time
                      className="ml-auto text-sm text-slate-400"
                      dateTime={request.created_at}
                    >
                      applied {formatDate(request.created_at.slice(0, 10))}
                    </time>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {formatDateRange(request.start_date, request.end_date)}
                  </p>
                  {request.remarks ? (
                    <p className="mt-1 text-sm text-slate-500">“{request.remarks}”</p>
                  ) : null}

                  {/* The admin's decision note is the whole point of the loop —
                      show it, don't just flip a badge. */}
                  {request.admin_comment ? (
                    <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">HR:</span>{" "}
                      {request.admin_comment}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
