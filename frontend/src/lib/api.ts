import type { TokenPair } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_KEY = "dayflow.access";
const REFRESH_KEY = "dayflow.refresh";

export const tokens = {
  get access() {
    return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY);
  },
  save(pair: TokenPair) {
    localStorage.setItem(ACCESS_KEY, pair.access_token);
    localStorage.setItem(REFRESH_KEY, pair.refresh_token);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Pull a human-readable message out of FastAPI's error shapes. */
async function messageFrom(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    // 422 from Pydantic: [{loc, msg, type}, ...]
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((d: { loc?: unknown[]; msg?: string }) => {
          const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : null;
          return field ? `${field}: ${d.msg}` : d.msg;
        })
        .join("; ");
    }
  } catch {
    /* fall through to the generic message */
  }
  return response.statusText || `Request failed (${response.status})`;
}

async function rawRequest(path: string, init: RequestInit, token: string | null) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
}

/** Refresh in flight, shared so a burst of 401s triggers one refresh, not five. */
let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refresh = tokens.refresh;
  if (!refresh) return false;

  refreshing ??= (async () => {
    try {
      const response = await rawRequest(
        "/auth/refresh",
        { method: "POST", body: JSON.stringify({ refresh_token: refresh }) },
        null,
      );
      if (!response.ok) return false;
      tokens.save((await response.json()) as TokenPair);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response = await rawRequest(path, init, tokens.access);

  // One retry after a refresh. If the refresh also fails the session is over.
  if (response.status === 401 && tokens.refresh) {
    if (await refreshTokens()) {
      response = await rawRequest(path, init, tokens.access);
    }
  }

  if (!response.ok) throw new ApiError(response.status, await messageFrom(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const get = <T,>(path: string) => api<T>(path);

export const post = <T,>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

export const put = <T,>(path: string, body: unknown) =>
  api<T>(path, { method: "PUT", body: JSON.stringify(body) });

export const patch = <T,>(path: string, body: unknown) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export { API_URL };
