"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Avatar,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Spinner,
} from "@/components/ui";
import { put } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { Profile } from "@/lib/types";

/** Fields HR owns. Shown, never editable here — the API rejects them too. */
function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { user, refreshUser } = useAuth();
  const profile = useApi<Profile>("/profile/me");

  const [form, setForm] = useState({ phone: "", address: "", profile_picture_url: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Seed the form once the profile lands.
  useEffect(() => {
    if (!profile.data) return;
    setForm({
      phone: profile.data.phone ?? "",
      address: profile.data.address ?? "",
      profile_picture_url: profile.data.profile_picture_url ?? "",
    });
  }, [profile.data]);

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      // Empty string means "cleared", so send null rather than "".
      await put("/profile/me", {
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        profile_picture_url: form.profile_picture_url.trim() || null,
      });
      setNotice("Saved.");
      profile.reload();
      await refreshUser();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your changes");
    } finally {
      setBusy(false);
    }
  }

  if (profile.loading) {
    return (
      <>
        <PageHeader title="Profile" />
        <Spinner />
      </>
    );
  }

  if (profile.error || !profile.data) {
    return (
      <>
        <PageHeader title="Profile" />
        <Alert>{profile.error ?? "Profile not found."}</Alert>
      </>
    );
  }

  const data = profile.data;

  return (
    <>
      <PageHeader title="Profile" subtitle="Keep your contact details current." />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <Card>
          <CardHeader title="Your details" subtitle="Only these three are yours to change." />
          <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
            {error ? <Alert>{error}</Alert> : null}
            {notice ? <Alert tone="success">{notice}</Alert> : null}

            <Field label="Phone">
              <Input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91 98450 11223"
                maxLength={20}
              />
            </Field>

            <Field label="Address">
              <Input
                autoComplete="street-address"
                value={form.address}
                onChange={set("address")}
                placeholder="14, Indiranagar 100ft Road, Bengaluru 560038"
                maxLength={300}
              />
            </Field>

            <Field label="Profile picture URL" hint="Paste a link to an image.">
              <Input
                type="url"
                value={form.profile_picture_url}
                onChange={set("profile_picture_url")}
                placeholder="https://…"
                maxLength={500}
              />
            </Field>

            <div className="flex gap-2">
              <Button type="submit" loading={busy}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setForm({
                    phone: data.phone ?? "",
                    address: data.address ?? "",
                    profile_picture_url: data.profile_picture_url ?? "",
                  })
                }
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Employment" subtitle="Maintained by HR" />
          <div className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={data.full_name} size="lg" />
              <div>
                <p className="font-semibold text-slate-900">{data.full_name}</p>
                <p className="text-sm text-slate-500">{data.job_title ?? "—"}</p>
              </div>
            </div>

            <dl className="mt-5">
              <ReadOnlyRow label="Employee ID" value={user?.employee_id ?? "—"} />
              <ReadOnlyRow label="Email" value={user?.email ?? "—"} />
              <ReadOnlyRow label="Department" value={data.department ?? "—"} />
              <ReadOnlyRow label="Joined" value={formatDate(data.date_joined, "long")} />
            </dl>

            <p className="mt-4 text-xs text-slate-500">
              Something wrong in this list? Ask HR — these fields are theirs to edit.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
