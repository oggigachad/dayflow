"use client";

import { useCallback, useEffect, useState } from "react";

import { get } from "@/lib/api";

type Snapshot<T> = { path: string | null; data: T | null; error: string | null };

type State<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

const messageOf = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Could not load this";

/**
 * GET a path, and re-fetch when the tab regains focus.
 *
 * Refetch-on-focus is what makes the approve-a-leave demo land: the admin
 * approves in one tab, the employee tab refreshes on click-back. Cheap, and
 * enough at this scale — no websockets.
 *
 * `loading` is derived from "the snapshot I hold is not for the path I was
 * asked about", so it can never disagree with the data. Requests are cancelled
 * on path change, so flipping a filter twice quickly cannot land stale rows.
 */
export function useApi<T>(path: string | null, { refetchOnFocus = true } = {}): State<T> {
  const [snapshot, setSnapshot] = useState<Snapshot<T>>({
    path: null,
    data: null,
    error: null,
  });

  const fetchInto = useCallback(
    (target: string, isCancelled: () => boolean) =>
      get<T>(target)
        .then((data) => {
          if (!isCancelled()) setSnapshot({ path: target, data, error: null });
        })
        .catch((cause: unknown) => {
          if (!isCancelled()) setSnapshot({ path: target, data: null, error: messageOf(cause) });
        }),
    [],
  );

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    void fetchInto(path, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [path, fetchInto]);

  const reload = useCallback(() => {
    if (path === null) return;
    void fetchInto(path, () => false);
  }, [path, fetchInto]);

  useEffect(() => {
    if (!refetchOnFocus || path === null) return;
    // Quiet refresh: the snapshot already matches this path, so `loading` stays
    // false and returning to the tab doesn't flash a spinner.
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [reload, refetchOnFocus, path]);

  const current = snapshot.path === path;
  return {
    data: current ? snapshot.data : null,
    error: current ? snapshot.error : null,
    loading: path !== null && !current,
    reload,
  };
}
