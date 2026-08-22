"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";

/** Shared chrome. Employees get a top nav, admins a sidebar (see AdminShell). */
export function AppTopBar({
  user,
  links,
}: {
  user: User;
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
        <Link href={links[0]?.href ?? "/"} className="text-base font-semibold tracking-tight text-slate-900">
          Dayflow
        </Link>

        <nav aria-label="Main" className="order-3 -mx-1 w-full overflow-x-auto sm:order-2 sm:mx-0 sm:w-auto">
          <ul className="flex gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "block rounded-lg bg-accent-50 px-3 py-1.5 text-sm font-medium text-accent-700"
                        : "block rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:order-3">
          <div className="flex items-center gap-2">
            <Avatar name={user.profile?.full_name ?? user.email} size="sm" />
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user.profile?.full_name ?? user.email}
              </p>
              <p className="text-xs text-slate-500">{user.employee_id}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
