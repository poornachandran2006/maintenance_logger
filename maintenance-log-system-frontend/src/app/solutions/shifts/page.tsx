import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ShiftsClientPage from "./ShiftsClientPage";
import { apiGetServer } from "@/lib/server-api";

export default async function Page() {
  try {
    // Server-side authentication check
    await apiGetServer("/auth/me", cookies());
  } catch (err) {
    redirect("/signin");
  }

  return <ShiftsClientPage />;
}
