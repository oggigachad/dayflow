"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/auth-shell";
import { Alert, Button, Field, Input, Select } from "@/components/ui";
import { homeFor, useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

const PASSWORD_HINT = "At least 8 characters, with a letter and a digit.";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    employee_id: "",
    email: "",
    password: "",
    role: "employee" as Role,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  // Mirror the server rule so the user hears about it before a round trip.
  // The server check in schemas.py is the one that counts.
  const passwordOk = form.password.length >= 8 && /[A-Za-z]/.test(form.password) && /\d/.test(form.password);
  const showPasswordError = form.password.length > 0 && !passwordOk;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const me = await signup(form);
      router.replace(homeFor(me.role));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the account");
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="One account covers attendance, leave and payroll."
      footer={
        <>
          Already have one?{" "}
          <Link href="/login" className="font-medium text-accent-600 hover:text-accent-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? <Alert>{error}</Alert> : null}

        <Field label="Full name">
          <Input
            name="full_name"
            autoComplete="name"
            required
            value={form.full_name}
            onChange={set("full_name")}
            placeholder="Asha Menon"
          />
        </Field>

        <Field label="Employee ID">
          <Input
            name="employee_id"
            required
            value={form.employee_id}
            onChange={set("employee_id")}
            placeholder="EMP104"
          />
        </Field>

        <Field label="Work email">
          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={set("email")}
            placeholder="you@dayflow.in"
          />
        </Field>

        <Field
          label="Password"
          hint={PASSWORD_HINT}
          error={showPasswordError ? PASSWORD_HINT : undefined}
        >
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={set("password")}
            aria-invalid={showPasswordError || undefined}
          />
        </Field>

        <Field label="Role">
          <Select name="role" value={form.role} onChange={set("role")}>
            <option value="employee">Employee</option>
            <option value="admin">Admin (HR)</option>
          </Select>
        </Field>

        <Button type="submit" loading={submitting} disabled={!passwordOk} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
