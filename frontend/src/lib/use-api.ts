"use client";

import { useCallback, useEffect, useState } from "react";

import { get } from "@/lib/api";

type State<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

/**
 * GET a path, and re-fetch when the tab regains focus.
 *
 * Refetch-on-focus is what makes the approve-a-leave demo land: the admin
 * approves in one tab, the employee tab refreshes on click-back. Cheap, and
 * enough at this scale — no websockets.
 */
export function useApi<T>(path: string | null, { refetchOnFocus = true } = {}): State<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);

  const load = useCallback(
    async (showSpinner: boolean) => {
      if (path === null) return;
      if (showSpinner) setLoading(true);
      try {
        setData(await get<T>(path));
        setError(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not load this");
      } finally {
        setLoading(false);
      }
    },
    [path],
  );

  useEffect(() => {
    void load(true);
  }, [load]);

  useEffect(() => {
    if (!refetchOnFocus || path === null) return;
    // Quiet refresh: no spinner, so returning to the tab doesn't flash.
    const onFocus = () => void load(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load, refetchOnFocus, path]);

  return { data, error, loading, reload: () => void load(false) };
}
