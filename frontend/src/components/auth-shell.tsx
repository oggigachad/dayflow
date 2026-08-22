import type { ReactNode } from "react";

/** Split screen: brand story on the left, form on the right. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <p className="text-lg font-semibold tracking-tight">Dayflow</p>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-balance">
            HR, without the paperwork.
          </p>
          <p className="mt-3 max-w-sm text-slate-300">
            Attendance, leave and payroll in one place — so approvals take a click, not a
            thread of emails.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-slate-400">
            <li>Check in and out in one tap</li>
            <li>Leave requests that route themselves</li>
            <li>Payroll your team can actually read</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500">Built for the Dayflow hackathon demo.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <p className="text-lg font-semibold tracking-tight text-slate-900 lg:hidden">
            Dayflow
          </p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 lg:mt-0">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-sm text-slate-500">{footer}</div>
        </div>
      </section>
    </main>
  );
}
