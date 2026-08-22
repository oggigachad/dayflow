"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthShell } from "@/components/auth-shell";
import { Alert, Button, Field, Input } from "@/components/ui";
import { homeFor, useAuth } from "@/lib/auth";

const DEMO = [
  { label: "Admin", email: "priya.nair@dayflow.in" },
  { label: "Employee", email: "arjun.rao@dayflow.in" },
];
const DEMO_PASSWORD = "dayflow123";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Don't show the form again.
  useEffect(() => {
    if (!loading && user) router.replace(homeFor(user.role));
  }, [user, loading, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const me = await login(email, password);
      router.replace(homeFor(me.role));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in");
      setSubmitting(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-accent-600 hover:text-accent-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? <Alert>{error}</Alert> : null}

        <Field label="Work email">
          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@dayflow.in"
          />
        </Field>

        <Field label="Password">
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Demo accounts
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO.map((account) => (
            <Button
              key={account.email}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fillDemo(account.email)}
            >
              {account.label}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Fills the form. Password for every demo account is{" "}
          <code className="font-mono">{DEMO_PASSWORD}</code>.
        </p>
      </div>
    </AuthShell>
  );
}
