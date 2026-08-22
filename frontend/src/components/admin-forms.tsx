"use client";

import { useState } from "react";

import { KeyValueEditor } from "@/components/key-value-editor";
import { Alert, Avatar, Button, Field, Input } from "@/components/ui";
import { put } from "@/lib/api";
import { money } from "@/lib/format";
import type { Profile, Salary } from "@/lib/types";

const sum = (entries: Record<string, number>) =>
  Object.values(entries).reduce((total, amount) => total + amount, 0);

/**
 * Admin profile editor. Seeded by a lazy useState initializer from `initial`,
 * so there is no copy-props-into-state effect; the parent re-keys it when the
 * server copy changes.
 */
export function AdminProfileForm({
  userId,
  initial,
  onSaved,
}: {
  userId: string;
  initial: Profile;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() => ({
    full_name: initial.full_name ?? "",
    phone: initial.phone ?? "",
    address: initial.address ?? "",
    profile_picture_url: initial.profile_picture_url ?? "",
    job_title: initial.job_title ?? "",
    department: initial.department ?? "",
    date_joined: initial.date_joined ?? "",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      // Blank means "cleared" for optional text. full_name is required, so it
      // goes as-is and the server rejects an empty one.
      const blankToNull = (value: string) => value.trim() || null;
      await put<Profile>(`/profile/${userId}`, {
        full_name: form.full_name.trim(),
        phone: blankToNull(form.phone),
        address: blankToNull(form.address),
        profile_picture_url: blankToNull(form.profile_picture_url),
        job_title: blankToNull(form.job_title),
        department: blankToNull(form.department),
        date_joined: form.date_joined || null,
      });
      setNotice("Profile saved.");
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <div className="flex items-center gap-3">
        <Avatar name={form.full_name || initial.full_name} size="lg" />
        <div className="flex-1">
          <Field label="Full name">
            <Input required value={form.full_name} onChange={set("full_name")} />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title">
          <Input value={form.job_title} onChange={set("job_title")} />
        </Field>
        <Field label="Department">
          <Input value={form.department} onChange={set("department")} />
        </Field>
        <Field label="Phone">
          <Input type="tel" value={form.phone} onChange={set("phone")} maxLength={20} />
        </Field>
        <Field label="Date joined">
          <Input type="date" value={form.date_joined} onChange={set("date_joined")} />
        </Field>
      </div>

      <Field label="Address">
        <Input value={form.address} onChange={set("address")} maxLength={300} />
      </Field>

      <Field label="Profile picture URL">
        <Input
          type="url"
          value={form.profile_picture_url}
          onChange={set("profile_picture_url")}
          maxLength={500}
        />
      </Field>

      <Button type="submit" loading={busy}>
        Save profile
      </Button>
    </form>
  );
}

/** Salary editor with a live gross/net preview before saving. */
export function AdminSalaryForm({
  userId,
  initial,
  onSaved,
}: {
  userId: string;
  initial: Salary;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() => ({
    base_salary: initial.base_salary,
    allowances: { ...initial.allowances },
    deductions: { ...initial.deductions },
    effective_date: initial.effective_date ?? "",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const gross = form.base_salary + sum(form.allowances);
  const net = gross - sum(form.deductions);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await put<Salary>(`/payroll/${userId}`, {
        base_salary: form.base_salary,
        allowances: form.allowances,
        deductions: form.deductions,
        effective_date: form.effective_date || null,
      });
      setNotice("Salary structure saved.");
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the structure");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 p-5" noValidate>
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Base salary (annual)">
          <Input
            type="number"
            min={0}
            step={10000}
            value={form.base_salary}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                base_salary: Number(event.target.value) || 0,
              }))
            }
            className="tabular-nums"
          />
        </Field>
        <Field label="Effective from">
          <Input
            type="date"
            value={form.effective_date}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, effective_date: event.target.value }))
            }
          />
        </Field>
      </div>

      <KeyValueEditor
        legend="Allowances"
        value={form.allowances}
        onChange={(allowances) => setForm((previous) => ({ ...previous, allowances }))}
      />

      <KeyValueEditor
        legend="Deductions"
        value={form.deductions}
        onChange={(deductions) => setForm((previous) => ({ ...previous, deductions }))}
      />

      <dl className="rounded-lg bg-slate-50 p-4 text-sm">
        <div className="flex justify-between py-1">
          <dt className="text-slate-500">Gross</dt>
          <dd className="font-medium tabular-nums text-slate-900">{money(gross)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-slate-500">Net</dt>
          <dd className="font-medium tabular-nums text-slate-900">{money(net)}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 py-1 pt-2">
          <dt className="text-slate-500">Monthly take-home</dt>
          <dd className="font-medium tabular-nums text-slate-900">
            {money(Math.round(net / 12))}
          </dd>
        </div>
      </dl>

      <Button type="submit" loading={busy}>
        Save structure
      </Button>
    </form>
  );
}
