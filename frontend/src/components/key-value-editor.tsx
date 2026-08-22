"use client";

import { useState } from "react";

import { Button, Field, Input } from "@/components/ui";

type Entries = Record<string, number>;

/**
 * Editor for the allowances / deductions JSON columns.
 *
 * Keys are free-form on purpose — every company names these differently, and a
 * fixed enum would need a migration per client. Blank-named rows are dropped on
 * save so a half-typed row can't create an empty key.
 */
export function KeyValueEditor({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: Entries;
  onChange: (next: Entries) => void;
}) {
  const [newKey, setNewKey] = useState("");
  const rows = Object.entries(value);

  const rename = (from: string, to: string) => {
    const next: Entries = {};
    for (const [key, amount] of Object.entries(value)) next[key === from ? to : key] = amount;
    onChange(next);
  };

  const setAmount = (key: string, amount: number) => onChange({ ...value, [key]: amount });

  const remove = (key: string) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  const add = () => {
    const key = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key || key in value) return;
    onChange({ ...value, [key]: 0 });
    setNewKey("");
  };

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{legend}</legend>

      {rows.length === 0 ? (
        <p className="mb-2 text-sm text-slate-500">None yet.</p>
      ) : (
        <ul className="mb-2 space-y-2">
          {rows.map(([key, amount]) => (
            <li key={key} className="flex gap-2">
              <Input
                aria-label={`${legend} name`}
                value={key}
                onChange={(event) => rename(key, event.target.value)}
                className="flex-1"
              />
              <Input
                aria-label={`${legend} amount for ${key}`}
                type="number"
                min={0}
                step={1000}
                value={amount}
                onChange={(event) => setAmount(key, Number(event.target.value) || 0)}
                className="w-32 tabular-nums"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(key)}
                aria-label={`Remove ${key}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Field label="">
          <Input
            aria-label={`New ${legend} name`}
            value={newKey}
            onChange={(event) => setNewKey(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
            placeholder="e.g. hra"
          />
        </Field>
        <Button type="button" variant="secondary" onClick={add} disabled={!newKey.trim()}>
          Add
        </Button>
      </div>
    </fieldset>
  );
}
