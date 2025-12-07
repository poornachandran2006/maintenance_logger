import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogsClientPage from "./LogsClientPage";

export default async function LogsPage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  // 🔥 If user is NOT logged in — redirect instantly (NO FLASH)
  if (!token) {
    redirect("/signin");
  }

  return <LogsClientPage />;
}
