"use client";

import { AppTopBar } from "@/components/app-top-bar";
import { RoleGate } from "@/components/role-gate";

const LINKS = [
  { href: "/employee/dashboard", label: "Overview" },
  { href: "/employee/attendance", label: "Attendance" },
  { href: "/employee/leave", label: "Leave" },
  { href: "/employee/payroll", label: "Payroll" },
  { href: "/employee/profile", label: "Profile" },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="employee">
      {(user) => (
        <div className="min-h-dvh">
          <AppTopBar user={user} links={LINKS} />
          <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">{children}</main>
        </div>
      )}
    </RoleGate>
  );
}
