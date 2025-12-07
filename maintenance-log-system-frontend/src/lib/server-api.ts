// src/lib/server-api.ts
import { cookies } from "next/headers";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Convert Next.js cookies() store into real "Cookie" header
async function buildCookieHeader(cookieStore: ReturnType<typeof cookies>) {
  return (await cookieStore)
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export async function apiGetServer(
  path: string,
  cookieStore: ReturnType<typeof cookies>
) {
  const cookieHeader = await buildCookieHeader(cookieStore);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader, // ✔ Correct cookie forwarding
    },
  });

  if (!res.ok) {
    throw new Error("Auth failed");
  }

  return res.json();
}
