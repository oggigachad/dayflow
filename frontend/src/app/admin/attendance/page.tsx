"use client";

import { useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Badge,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Spinner,
  StatCard,
  Table,
  TableWrap,
  Td,
  Th,
  attendanceTone,
} from "@/components/ui";
import { ATTENDANCE_LABEL, formatDate, formatTime, formatWorked } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { AttendanceRow, AttendanceStatus } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

export default function AdminAttendancePage() {
  const [on, setOn] = useState(today());
  const [status, setStatus] = useState<AttendanceStatus | "all">("all");

  const attendance = useApi<AttendanceRow[]>(`/attendance?on=${on}`);

  const rows = useMemo(() => {
    const all = attendance.data ?? [];
    return status === "all" ? all : all.filter((row) => row.status === status);
  }, [attendance.data, status]);

  const counts = useMemo(() => {
    const all = attendance.data ?? [];
    return {
      present: all.filter((r) => r.status === "present").length,
      half: all.filter((r) => r.status === "half_day").length,
      absent: all.filter((r) => r.status === "absent").length,
    };
  }, [attendance.data]);

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle="Every employee's record for a single day."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Present" value={attendance.loading ? <Spinner /> : counts.present} tone="emerald" />
        <StatCard label="Half day" value={attendance.loading ? <Spinner /> : counts.half} tone="amber" />
        <StatCard label="Absent" value={attendance.loading ? <Spinner /> : counts.absent} tone="slate" />
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 border-b border-slate-200 p-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Date</span>
            <Input
              type="date"
              value={on}
              max={today()}
              onChange={(event) => setOn(event.target.value || today())}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Status</span>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as AttendanceStatus | "all")}
            >
              <option value="all">All statuses</option>
              <option value="present">Present</option>
              <option value="half_day">Half day</option>
              <option value="absent">Absent</option>
              <option value="leave">On leave</option>
            </Select>
          </label>
        </div>

        {attendance.error ? (
          <div className="p-5">
            <Alert>{attendance.error}</Alert>
          </div>
        ) : attendance.loading ? (
          <div className="p-5">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No records for this filter"
            hint={`Nothing logged on ${formatDate(on, "long")}${status === "all" ? "" : ` with status “${ATTENDANCE_LABEL[status]}”`}.`}
          />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Employee</Th>
                  <Th>ID</Th>
                  <Th>Status</Th>
                  <Th>Check in</Th>
                  <Th>Check out</Th>
                  <Th className="text-right">Worked</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={row.full_name} size="sm" />
                        <span className="font-medium text-slate-900">{row.full_name}</span>
                      </div>
                    </Td>
                    <Td className="font-mono text-xs">{row.employee_id}</Td>
                    <Td>
                      <Badge tone={attendanceTone(row.status)}>
                        {ATTENDANCE_LABEL[row.status]}
                      </Badge>
                    </Td>
                    <Td className="tabular-nums">{formatTime(row.check_in)}</Td>
                    <Td className="tabular-nums">{formatTime(row.check_out)}</Td>
                    <Td className="text-right tabular-nums">
                      {formatWorked(row.check_in, row.check_out)}
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
