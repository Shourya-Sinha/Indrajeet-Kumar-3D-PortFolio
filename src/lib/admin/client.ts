"use client";

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function ensureCsrfToken(): Promise<string> {
  const existing = readCookie("ss_admin_csrf");
  if (existing) return existing;
  const res = await fetch("/api/admin/auth/csrf", { credentials: "same-origin" });
  const json = (await res.json()) as { csrfToken?: string };
  return json.csrfToken || "";
}

export async function adminFetch<T = unknown>(
  url: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers || {});

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = await ensureCsrfToken();
    if (csrf) headers.set("x-csrf-token", csrf);
    if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const resp = await fetch(url, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  if (resp.status === 401 && typeof window !== "undefined") {
    if (!window.location.pathname.startsWith("/admin/login")) {
      window.location.href = "/admin/login";
    }
  }

  let json: { ok?: boolean; data?: T; error?: string; [k: string]: unknown } = {};
  try {
    json = (await resp.json()) as typeof json;
  } catch {
    // non-json
  }

  return {
    ok: resp.ok && json.ok !== false,
    data: (json.data ?? json) as T,
    error: json.error,
    status: resp.status,
  };
}
