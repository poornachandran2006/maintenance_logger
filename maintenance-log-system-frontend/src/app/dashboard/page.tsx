// src/app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  // If no token → redirect immediately (NO FLASH)
  if (!token) {
    redirect("/signin");
  }

  // Call backend to validate token
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
    {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    redirect("/signin");
  }

  const data = await res.json();
  const user = data.user;

  return <DashboardClient user={user} />;
}
