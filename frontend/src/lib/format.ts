import type { AttendanceStatus, LeaveStatus, LeaveType } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const money = (amount: number) => inr.format(amount);

export function formatDate(value: string | null, style: "short" | "long" = "short") {
  if (!value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

/** Worked hours between check-in and check-out, e.g. "8h 47m". */
export function formatWorked(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return "—";
  const minutes = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60_000,
  );
  if (minutes < 0) return "—";
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export function formatDateRange(start: string, end: string) {
  return start === end ? formatDate(start) : `${formatDate(start)} → ${formatDate(end)}`;
}

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  half_day: "Half day",
  leave: "On leave",
};

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  paid: "Paid",
  sick: "Sick",
  unpaid: "Unpaid",
};

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

/** Initials for the avatar chip — at most two letters. */
export function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
