"use client";

import {
  Alert,
  Card,
  CardHeader,
  PageHeader,
  Spinner,
  StatCard,
  Table,
  TableWrap,
  Td,
  Th,
} from "@/components/ui";
import { formatDate, money } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { Salary } from "@/lib/types";

const startCase = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function EmployeePayrollPage() {
  const payroll = useApi<Salary>("/payroll/me");

  if (payroll.loading) {
    return (
      <>
        <PageHeader title="Payroll" />
        <Spinner />
      </>
    );
  }

  if (payroll.error || !payroll.data) {
    return (
      <>
        <PageHeader title="Payroll" />
        <Alert>{payroll.error ?? "No salary structure on file yet."}</Alert>
      </>
    );
  }

  const salary = payroll.data;
  const allowances = Object.entries(salary.allowances);
  const deductions = Object.entries(salary.deductions);

  return (
    <>
      <PageHeader
        title="Payroll"
        subtitle={`Annual structure${salary.effective_date ? `, effective ${formatDate(salary.effective_date, "long")}` : ""}. Read-only — HR maintains this.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Gross (annual)" value={money(salary.gross)} tone="sky" />
        <StatCard label="Deductions" value={money(salary.gross - salary.net)} tone="amber" />
        <StatCard
          label="Net (annual)"
          value={money(salary.net)}
          hint={`≈ ${money(Math.round(salary.net / 12))} a month`}
          tone="emerald"
        />
      </div>

      <Card>
        <CardHeader title="Breakdown" subtitle="How the number above is built" />
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Component</Th>
                <Th>Type</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td className="font-medium text-slate-900">Base salary</Td>
                <Td>Earning</Td>
                <Td className="text-right tabular-nums">{money(salary.base_salary)}</Td>
              </tr>

              {allowances.map(([key, amount]) => (
                <tr key={`a-${key}`}>
                  <Td className="font-medium text-slate-900">{startCase(key)}</Td>
                  <Td>Allowance</Td>
                  <Td className="text-right tabular-nums">{money(amount)}</Td>
                </tr>
              ))}

              {deductions.map(([key, amount]) => (
                <tr key={`d-${key}`}>
                  <Td className="font-medium text-slate-900">{startCase(key)}</Td>
                  <Td>Deduction</Td>
                  <Td className="text-right tabular-nums text-rose-600">−{money(amount)}</Td>
                </tr>
              ))}

              <tr className="bg-slate-50">
                <Td className="font-semibold text-slate-900">Net</Td>
                <Td />
                <Td className="text-right font-semibold tabular-nums text-slate-900">
                  {money(salary.net)}
                </Td>
              </tr>
            </tbody>
          </Table>
        </TableWrap>
      </Card>
    </>
  );
}
