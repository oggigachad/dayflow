"use client";

import { useState } from "react";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Spinner,
  Textarea,
  leaveTone,
} from "@/components/ui";
import { patch } from "@/lib/api";
import {
  LEAVE_STATUS_LABEL,
  LEAVE_TYPE_LABEL,
  formatDate,
  formatDateRange,
} from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { LeaveRow, LeaveStatus } from "@/lib/types";

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export default function AdminLeavePage() {
  const [filter, setFilter] = useState<Filter>("pending");
  const requests = useApi<LeaveRow[]>(filter === "all" ? "/leave" : `/leave?status=${filter}`);

  // One comment draft and one in-flight id at a time, keyed by request.
  const [comments, setComments] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function decide(request: LeaveRow, status: Extract<LeaveStatus, "approved" | "rejected">) {
    setBusyId(request.id);
    setError(null);
    setNotice(null);
    try {
      await patch(`/leave/${request.id}`, {
        status,
        admin_comment: comments[request.id]?.trim() || null,
      });
      setNotice(
        `${request.full_name}'s ${LEAVE_TYPE_LABEL[request.leave_type].toLowerCase()} leave was ${status}.`,
      );
      setComments((previous) => {
        const next = { ...previous };
        delete next[request.id];
        return next;
      });
      requests.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record that decision");
    } finally {
      setBusyId(null);
    }
  }

  const rows = requests.data ?? [];

  return (
    <>
      <PageHeader
        title="Leave approvals"
        subtitle="Approve or reject time off, with a note the employee will see."
      />

      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <Card>
        <CardHeader
          title={FILTERS.find((f) => f.value === filter)!.label + " requests"}
          subtitle={requests.data ? `${rows.length} in this view` : undefined}
          action={
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
              {FILTERS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={filter === option.value ? "primary" : "secondary"}
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          }
        />

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
            title={filter === "pending" ? "Queue is clear" : "Nothing here"}
            hint={
              filter === "pending"
                ? "Every request has a decision. Nice."
                : "Try a different filter."
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((request) => (
              <li key={request.id} className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar name={request.full_name} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-medium text-slate-900">{request.full_name}</p>
                      <span className="font-mono text-xs text-slate-400">
                        {request.employee_id}
                      </span>
                      <Badge tone={leaveTone(request.status)}>
                        {LEAVE_STATUS_LABEL[request.status]}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium">
                        {LEAVE_TYPE_LABEL[request.leave_type]} leave
                      </span>{" "}
                      · {formatDateRange(request.start_date, request.end_date)} · {request.days}{" "}
                      day{request.days === 1 ? "" : "s"}
                    </p>

                    {request.remarks ? (
                      <p className="mt-1 text-sm text-slate-500">“{request.remarks}”</p>
                    ) : null}

                    <p className="mt-1 text-xs text-slate-400">
                      Applied {formatDate(request.created_at.slice(0, 10))}
                    </p>

                    {request.status === "pending" ? (
                      <div className="mt-3 space-y-2">
                        <label className="block">
                          <span className="sr-only">
                            Comment for {request.full_name}&apos;s request
                          </span>
                          <Textarea
                            rows={2}
                            maxLength={500}
                            value={comments[request.id] ?? ""}
                            onChange={(event) =>
                              setComments((previous) => ({
                                ...previous,
                                [request.id]: event.target.value,
                              }))
                            }
                            placeholder="Optional note — the employee sees this."
                          />
                        </label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            loading={busyId === request.id}
                            onClick={() => decide(request, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={busyId === request.id}
                            onClick={() => decide(request, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ) : request.admin_comment ? (
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Your note:</span>{" "}
                        {request.admin_comment}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
