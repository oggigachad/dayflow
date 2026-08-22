"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { PageLoading } from "@/components/ui";
import { homeFor, useAuth } from "@/lib/auth";
import type { Role, User } from "@/lib/types";

/** Client-side gate. Convenience only — every API route checks the role itself. */
export function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: (user: User) => ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = user?.role === role;

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(homeFor(user.role));
  }, [user, loading, role, router]);

  if (loading || !user || !allowed) return <PageLoading />;
  return <>{children(user)}</>;
}
