"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Badge,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Spinner,
  Table,
  TableWrap,
  Td,
  Th,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { EmployeeListItem } from "@/lib/types";

export default function AdminEmployeesPage() {
  const employees = useApi<EmployeeListItem[]>("/employees");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const all = employees.data ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((employee) =>
      [employee.full_name, employee.employee_id, employee.email, employee.department ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [employees.data, query]);

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle={
          employees.data ? `${employees.data.length} people on the directory` : "Loading directory"
        }
      />

      <Card>
        <div className="border-b border-slate-200 p-4">
          <label className="block max-w-sm">
            <span className="sr-only">Search employees</span>
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, ID, email or department"
            />
          </label>
        </div>

        {employees.error ? (
          <div className="p-5">
            <Alert>{employees.error}</Alert>
          </div>
        ) : employees.loading ? (
          <div className="p-5">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Nobody matches that"
            hint={query ? `No results for “${query}”. Try a shorter search.` : undefined}
          />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Employee ID</Th>
                  <Th>Role</Th>
                  <Th>Department</Th>
                  <Th>Joined</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={employee.full_name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900">{employee.full_name}</p>
                          <p className="text-sm text-slate-500">{employee.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="font-mono text-xs">{employee.employee_id}</Td>
                    <Td>
                      <Badge tone={employee.role === "admin" ? "sky" : "slate"}>
                        {employee.role === "admin" ? "Admin" : "Employee"}
                      </Badge>
                    </Td>
                    <Td>{employee.department ?? "—"}</Td>
                    <Td>{formatDate(employee.date_joined)}</Td>
                    <Td className="text-right">
                      <Link
                        href={`/admin/employees/${employee.id}`}
                        className="font-medium text-accent-600 hover:text-accent-700"
                      >
                        Open
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
