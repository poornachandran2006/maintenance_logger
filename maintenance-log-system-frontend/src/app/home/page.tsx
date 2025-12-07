export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default function HomePage() {
  const cookieStore = cookies();

  // Fix: store cookie in a variable with explicit optional type
  const tokenCookie = cookieStore.get("token") as { value: string } | undefined;

  const token = tokenCookie?.value;

  if (!token) {
    redirect("/signin");
  }

  return <HomeClient />;
}
