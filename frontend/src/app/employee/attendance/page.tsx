"use client";

import { useState } from "react";

import {
  Alert,
  Badge,
  Button,
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
import { post } from "@/lib/api";
import {
  ATTENDANCE_LABEL,
  formatDate,
  formatTime,
  formatWorked,
} from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { AttendanceRecord, AttendanceToday } from "@/lib/types";

type Range = "week" | "month";

export default function EmployeeAttendancePage() {
  const [range, setRange] = useState<Range>("week");
  const today = useApi<AttendanceToday>("/attendance/today");
  const history = useApi<AttendanceRecord[]>(`/attendance/me?range=${range}`);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function clock(action: "check-in" | "check-out") {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await post(`/attendance/${action}`);
      setNotice(action === "check-in" ? "Checked in. Have a good one." : "Checked out. See you tomorrow.");
      today.reload();
      history.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That did not work");
    } finally {
      setBusy(false);
    }
  }

  const state = today.data;
  const rows = history.data ?? [];

  return (
    <>
      <PageHeader title="Attendance" subtitle="Clock in for the day and review your history." />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {formatDate(state?.date ?? null, "long")}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {today.loading ? (
                <Spinner />
              ) : !state?.checked_in ? (
                "You have not checked in yet"
              ) : state.checked_out ? (
                `${formatTime(state.record?.check_in ?? null)} – ${formatTime(state.record?.check_out ?? null)}`
              ) : (
                `Checked in at ${formatTime(state.record?.check_in ?? null)}`
              )}
            </p>
            {state?.checked_out ? (
              <p className="mt-1 text-sm text-slate-500">
                Worked {formatWorked(state.record?.check_in ?? null, state.record?.check_out ?? null)}
              </p>
            ) : null}
          </div>

          {/* Button state comes from the server, so the UI never offers an
              action that would be rejected. */}
          <div className="flex gap-2">
            <Button
              onClick={() => clock("check-in")}
              loading={busy && !state?.checked_in}
              disabled={today.loading || Boolean(state?.checked_in)}
            >
              Check in
            </Button>
            <Button
              variant="secondary"
              onClick={() => clock("check-out")}
              loading={busy && Boolean(state?.checked_in)}
              disabled={today.loading || !state?.checked_in || Boolean(state?.checked_out)}
            >
              Check out
            </Button>
          </div>
        </div>

        {error ? <div className="mt-4">
          <Alert>{error}</Alert>
        </div> : null}
        {notice ? <div className="mt-4">
          <Alert tone="success">{notice}</Alert>
        </div> : null}
      </Card>

      <Card>
        <CardHeader
          title="History"
          subtitle={range === "week" ? "Last 7 days" : "Last 30 days"}
          action={
            <div className="flex gap-1" role="group" aria-label="Date range">
              {(["week", "month"] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={range === option ? "primary" : "secondary"}
                  onClick={() => setRange(option)}
                  aria-pressed={range === option}
                >
                  {option === "week" ? "Week" : "Month"}
                </Button>
              ))}
            </div>
          }
        />

        {history.error ? (
          <div className="p-5">
            <Alert>{history.error}</Alert>
          </div>
        ) : history.loading ? (
          <div className="p-5">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No records in this range" hint="Check in above to start building history." />
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
                {rows.map((record) => (
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
