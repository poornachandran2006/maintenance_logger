export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default function HomePage() {
  const cookieStore = cookies();

  // Fix: Save the result first so TS understands the type
  const tokenCookie = cookieStore.get("token");
  const token = tokenCookie?.value;

  if (!token) {
    redirect("/signin");
  }

  return <HomeClient />;
}
