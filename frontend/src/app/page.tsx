"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PageLoading } from "@/components/ui";
import { homeFor, useAuth } from "@/lib/auth";

/** Sends each visitor to the dashboard their role owns. */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? homeFor(user.role) : "/login");
  }, [user, loading, router]);

  return <PageLoading />;
}
