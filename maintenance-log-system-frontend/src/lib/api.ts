// src/lib/api.ts
"use client";

// ----------------------------------------------------
// BACKEND BASE URL
// ----------------------------------------------------
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ----------------------------------------------------
// HANDLE API RESPONSES
// ----------------------------------------------------
async function handleResponse<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    let payload: any = {};
    try {
      payload = await res.json();
    } catch {}

    const message =
      payload?.message ||
      payload?.error ||
      res.statusText ||
      "API Request Failed";

    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null as T;

  try {
    return (await res.json()) as T;
  } catch {
    return null as T;
  }
}

// ----------------------------------------------------
// CORE REQUEST HANDLER — NOW COOKIE BASED
// ----------------------------------------------------
async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",                     // 🔥 IMPORTANT!
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return handleResponse<T>(res);
}

// ----------------------------------------------------
// PUBLIC HELPER FUNCTIONS
// ----------------------------------------------------
export function apiGet<T = any>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T = any>(path: string, body?: any): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T = any>(path: string, body?: any): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = any>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
