"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { RoleGate } from "@/components/role-gate";
import { Avatar, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/leave", label: "Leave approvals" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <RoleGate role="admin">
      {(user) => (
        <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
          <aside className="flex flex-col border-b border-slate-200 bg-white lg:border-r lg:border-b-0">
            <div className="px-5 py-4">
              <Link href="/admin/dashboard" className="text-base font-semibold tracking-tight text-slate-900">
                Dayflow
              </Link>
              <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-400 uppercase">
                HR console
              </p>
            </div>

            <nav aria-label="Admin" className="px-3 pb-3 lg:flex-1">
              <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                {LINKS.map((link) => {
                  // Sub-pages like /admin/employees/4 keep the parent highlighted.
                  const active =
                    pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={
                          active
                            ? "block rounded-lg bg-accent-50 px-3 py-2 text-sm font-medium whitespace-nowrap text-accent-700"
                            : "block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-600 hover:bg-slate-100"
                        }
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2 border-slate-200 px-5 py-4 lg:border-t">
              <Avatar name={user.profile?.full_name ?? user.email} size="sm" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-slate-900">
                  {user.profile?.full_name ?? user.email}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user.profile?.job_title ?? "Administrator"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                Log out
              </Button>
            </div>
          </aside>

          <main className="space-y-6 px-6 py-8">{children}</main>
        </div>
      )}
    </RoleGate>
  );
}
