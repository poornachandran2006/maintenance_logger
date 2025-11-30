const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://maintenance-log-system-backend-1.onrender.com/api";

/**
 * Convert server response into useful error message
 */
async function handleResponse(res: Response) {
  if (!res.ok) {
    let payload = {};

    try {
      payload = await res.json();
    } catch (e) {
      // ignore JSON parsing error
    }

    const msg =
      // backend explicit message
      (payload as any).message ||
      (payload as any).error ||
      (payload as any).details ||
      // fallback to HTTP status text
      res.statusText ||
      "API request failed";

    throw new Error(msg);
  }

  // success → return parsed JSON
  return res.json();
}

export async function apiGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function apiPut(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function apiDelete(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}
